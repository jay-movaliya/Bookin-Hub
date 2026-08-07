import { ApiResponse } from "../../shared/ApiResponse.js";
import { asyncHandler } from "../../shared/asyncHandler.js";
import { HotelBooking } from "./booking.model.js";
// import { HotelRoom } from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.model.js";
import { sendBookingCancellation, sendRatingEmail, sendRefundNotification } from "../../services/email.service.js";
import { getRedisClient } from "../../config/redis.js";
import { enqueueNotification } from "../../queues/notification.queue.js";
import crypto from "crypto";

const createBooking = asyncHandler(async (req, res) => {
    try {
        const {
            hotel,
            room,
            bookingStartDate,
            bookingEndDate,
            totalAmount,
            personDetails
        } = req.body;

        const userId = req.user._id;

        if (!personDetails || !Array.isArray(personDetails) || personDetails.length === 0) {
            return res.status(400).json({ message: "At least one person detail is required." });
        }

        for (const person of personDetails) {
            if (!person.name || !person.age || !person.aadhar) {
                return res.status(400).json({
                    message: "Each person must have name, age, and aadhaar number.", status: false
                });
            }
        }

        const hotelObj = await Hotel.findById(hotel);
        if (!hotelObj) {
            return res.status(404).json({ message: "Hotel not found", status: false });
        }
        if (hotelObj.status === "blocked") {
            return res.status(403).json({ message: "The operation license for this hotel has been suspended or expired. Booking is disabled.", status: false });
        }

        const existingDbBooking = await HotelBooking.findOne({
            room,
            $or: [
                { bookingStartDate: { $lte: bookingEndDate }, bookingEndDate: { $gte: bookingStartDate } },
            ],
            bookingStatus: { $ne: "cancelled" },
        });

        if (existingDbBooking) {
            return res.status(400).json({ message: "Room not available for selected dates.", status: false });
        }

        // 1. Check Redis for an atomic lock on this room
        const redisClient = getRedisClient();
        const lockKey = `lock:room:${room}`;
        const userIdStr = String(userId);

        // Try to atomically set the lock if it doesn't exist (NX)
        const lockAcquired = await redisClient.set(lockKey, userIdStr, "EX", 300, "NX");

        if (!lockAcquired) {
            // Lock already exists, let's see if it's ours
            const currentLockOwner = await redisClient.get(lockKey);
            if (currentLockOwner !== userIdStr) {
                return res.status(400).json({ message: "This room is currently being booked by another customer. Please try again in 5 minutes.", status: false });
            }
            // If it is ours, renew the lock
            await redisClient.setex(lockKey, 300, userIdStr);
        }
        const tempBookingId = crypto.randomUUID();

        // 3. Store the temporary booking payload in Redis for 5 minutes
        const bookingPayload = {
            hotel,
            user: userId,
            room,
            bookingStartDate,
            bookingEndDate,
            totalAmount,
            personDetails
        };
        const tempBookingKey = `temp_booking:${tempBookingId}`;
        await redisClient.setex(tempBookingKey, 300, JSON.stringify(bookingPayload));

        res.status(201).json(new ApiResponse(200, { bookingId: tempBookingId }, "Booking initiated. Please complete payment within 5 minutes!"));
    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ message: "Error creating booking", error: error.message, status: false });
    }
});

const getUserBookings = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const bookings = await HotelBooking.find({ user: userId })
            .populate("hotel")
            .populate("room");

        res.status(200).json(new ApiResponse(200, bookings, "Bookings retrived successfully"));
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings", error: error.message, status: false });
    }
});

const getOwnerBookings = asyncHandler(async (req, res) => {
    const ownerHotels = await Hotel.find({ hotel_owner: req.hotel_owner._id }).select('_id');

    if (!ownerHotels || ownerHotels.length === 0) {
        return res.status(200).json({
            success: true,
            data: [],
            message: "No hotels found for this owner"
        });
    }

    const hotelIds = ownerHotels.map(hotel => hotel._id);

    const { status } = req.query;
    const query = { hotel: { $in: hotelIds } };

    if (status && ['confirmed', 'cancelled', 'completed', 'pending', 'failed', 'refunded'].includes(status)) {
        query.bookingStatus = status;
    }

    const bookings = await HotelBooking.find(query)
        .populate('hotel', 'name')
        .populate('room', 'room_type')
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, bookings, "Booking retrived successfully"));
});

const updateStatus = asyncHandler(async (req, res) => {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
        res.status(500).json({ message: "Some internal error occured while", status: false });
    }
    const booking = await HotelBooking.findById(bookingId).populate("user").populate('hotel');
    if (status == "completed") {
        booking.bookingStatus = "completed";
        await booking.save();
        try {
            await sendRatingEmail({
                email: booking.user.email,
                userName: booking.user.name,
                bookingId: booking._id,
                hotelName: booking.hotel?.name
            });
        } catch (emailError) {
            console.error("Error sending rating email:", emailError.message);
        }

        res.status(200).json(new ApiResponse(200, null, "Status updated successfully"));
    } else if (status == "cancelled") {
        booking.bookingStatus = status;
        await booking.save();
        try {
            await sendBookingCancellation({ email: booking.user.email, userName: booking.user.name, bookingId: booking._id, hotelName: booking.hotel.name });
        } catch (emailError) {
            console.error("Error sending cancellation email:", emailError.message);
        }
        res.status(200).json(new ApiResponse(200, null, "Status updated successfully"));
    }
});

const cancelBooking = asyncHandler(async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user._id;

        const booking = await HotelBooking.findOne({ _id: bookingId, user: userId }).populate("hotel");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found.", status: false });
        }

        if (booking.bookingStatus === "cancelled") {
            return res.status(400).json({ message: "Booking already cancelled.", status: false });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookingStart = new Date(booking.bookingStartDate);
        bookingStart.setHours(0, 0, 0, 0);

        if (today >= bookingStart) {
            return res.status(400).json({ message: "Bookings cannot be cancelled on or after the check-in date.", status: false });
        }

        booking.bookingStatus = "cancelled";
        await booking.save();

        try {
            await sendBookingCancellation({ email: req.user.email, userName: req.user.name, bookingId: booking._id, hotelName: booking.hotel.name });
        } catch (emailError) {
            console.error("Error sending cancellation email:", emailError.message);
        }

        res.status(200).json(new ApiResponse(200, null, "Booking cancelled successfully"));
    } catch (error) {
        res.status(500).json({ message: "Error cancelling booking", error: error.message, status: false });
    }
});

const checkRoomAvailability = asyncHandler(async (req, res) => {
    try {
        const { roomId, startDate, endDate } = req.body;

        const conflictingBookings = await HotelBooking.find({
            room: roomId,
            bookingStartDate: { $lte: new Date(endDate) },
            bookingEndDate: { $gte: new Date(startDate) },
            bookingStatus: { $ne: "cancelled" },
        });

        if (conflictingBookings.length > 0) {
            return res.status(200).json({ isAvailable: false });
        }

        const redisClient = getRedisClient();
        const lockKey = `lock:room:${roomId}`;
        const userIdStr = String(req.user._id);

        // Try to atomically set the lock
        const lockAcquired = await redisClient.set(lockKey, userIdStr, "EX", 300, "NX");

        if (!lockAcquired) {
            const currentLockOwner = await redisClient.get(lockKey);
            if (currentLockOwner !== userIdStr) {
                return res.status(200).json({ isAvailable: false, message: "Room is currently locked by another user" });
            }
            // Renew our own lock
            await redisClient.setex(lockKey, 300, userIdStr);
        }

        res.status(200).json({ isAvailable: true });
    } catch (error) {
        res.status(500).json({ message: "Error checking availability", error: error.message, status: false });
    }
});

const getRoomBookingsByHotel = asyncHandler(async (req, res) => {
    try {
        const { hotelId } = req.params;
        const bookings = await HotelBooking.find({
            hotel: hotelId,
            bookingStatus: { $ne: "cancelled" },
            bookingEndDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        }).select("room bookingStartDate bookingEndDate bookingStatus");

        res.status(200).json(new ApiResponse(200, bookings, "Room bookings retrieved successfully"));
    } catch (error) {
        res.status(500).json({ message: "Error fetching room bookings", error: error.message, status: false });
    }
});

const initiateRoomLock = asyncHandler(async (req, res) => {
    try {
        const { roomId } = req.body;
        const redisClient = getRedisClient();
        const lockKey = `lock:room:${roomId}`;
        const userIdStr = String(req.user._id);

        const lockAcquired = await redisClient.set(lockKey, userIdStr, "EX", 300, "NX");

        if (!lockAcquired) {
            const currentLockOwner = await redisClient.get(lockKey);
            if (currentLockOwner !== userIdStr) {
                return res.status(200).json({ success: false, message: "Room is currently being booked by another user" });
            }
            // Renew our own lock
            await redisClient.setex(lockKey, 300, userIdStr);
        }

        res.status(200).json({ success: true, message: "Room locked temporarily" });
    } catch (error) {
        res.status(500).json({ message: "Error locking room", error: error.message, status: false });
    }
});

const getRefundPendingBookings = asyncHandler(async (req, res) => {
    try {
        const cancelledBookings = await HotelBooking.find({ bookingStatus: "cancelled" })
            .populate("hotel")
            .populate("user", "name email contact profilePic")
            .populate("room", "room_type room_number");

        res.status(200).json(new ApiResponse(200, cancelledBookings, "Refund pending bookings retrieved successfully"));
    } catch (error) {
        res.status(500).json({ message: "Error fetching refund pending bookings", error: error.message, status: false });
    }
});

const getRefundCompletedBookings = asyncHandler(async (req, res) => {
    try {
        const refundedBookings = await HotelBooking.find({ bookingStatus: "refunded" })
            .populate("hotel")
            .populate("user", "name email contact profilePic")
            .populate("room", "room_type room_number");

        res.status(200).json(new ApiResponse(200, refundedBookings, "Refund completed bookings retrieved successfully"));
    } catch (error) {
        res.status(500).json({ message: "Error fetching refund completed bookings", error: error.message, status: false });
    }
});

const updateBookingToRefunded = asyncHandler(async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await HotelBooking.findById(bookingId).populate("hotel").populate("user");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found", status: false });
        }

        if (booking.bookingStatus !== "cancelled") {
            return res.status(400).json({ message: "Booking must be cancelled before it can be refunded", status: false });
        }

        booking.bookingStatus = "refunded";
        await booking.save();

        try {
            if (booking.user && booking.user.email) {
                await enqueueNotification({
                    channel: "email",
                    type: "booking_refunded_user",
                    data: {
                        email: booking.user.email,
                        userName: booking.user.name,
                        bookingId: booking._id,
                        hotelName: booking.hotel?.name || "Hotel",
                        totalAmount: booking.totalAmount
                    }
                });
            }
        } catch (notificationError) {
            console.error("Error sending refund notification:", notificationError.message);
        }

        res.status(200).json(new ApiResponse(200, null, "Booking status updated to refunded"));
    } catch (error) {
        res.status(500).json({ message: "Error updating booking status", error: error.message, status: false });
    }
});

export { checkRoomAvailability, createBooking, getUserBookings, getOwnerBookings, updateStatus, cancelBooking, getRoomBookingsByHotel, initiateRoomLock, getRefundPendingBookings, getRefundCompletedBookings, updateBookingToRefunded };
