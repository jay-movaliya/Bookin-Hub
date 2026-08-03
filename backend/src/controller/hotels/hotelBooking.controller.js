import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HotelBooking } from "../../models/hotels/hotelBookings.model.js";
import { HotelRoom } from "../../models/hotels/hotelRoom.models.js";
import Hotel from "../../models/hotels/hotel.models.js"
import { sendBookingCancellation, sendBookingConfirmation, sendRatingEmail } from "../../services/hotel/emailServices.js"; // Your email service


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
        console.log("called",userId);

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

        // Check if room is available for booking dates
        const existingBooking = await HotelBooking.findOne({
            room,
            $or: [
                { bookingStartDate: { $lte: bookingEndDate }, bookingEndDate: { $gte: bookingStartDate } },
            ],
            bookingStatus: { $ne: "cancelled" },
        });

        if (existingBooking) {
            return res.status(400).json({ message: "Room not available for selected dates.", status: false });
        }

        const newBooking = await HotelBooking.create({
            hotel,
            user: userId,
            room,
            bookingStartDate,
            bookingEndDate,
            totalAmount,
            paymentStatus: "pending", // Update after payment success
            personDetails // Include person details in the booking
        });
        const hotelObj = await Hotel.findById(hotel)
        await sendBookingConfirmation({ email: req.user.email, userName: req.user.name, bookingId: newBooking._id, hotelName: hotelObj.name, checkInDate: newBooking.bookingStartDate, checkOutDate: newBooking.bookingEndDate, totalAmount: newBooking.totalAmount })
        res.status(201).json(new ApiResponse(200, null, "Booking done successfully!"))
    } catch (error) {
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
    const { bookingId, status } = req.body

    if (!bookingId || !status) {
        res.status(500).json({ message: "Some internal error occured while", status: false })
    }
    const booking = await HotelBooking.findById(bookingId).populate("user").populate('hotel')
    if (status == "completed") {
        booking.bookingStatus = "completed"
        await booking.save()
        await sendRatingEmail({
            email: booking.user.email,
            userName: booking.user.name,
            bookingId: booking._id,
            hotelName: booking.hotel?.name
        })

        res.status(200).json(new ApiResponse(200, null, "Status updated successfully"))
    } else if (status == "cancelled") {
        booking.bookingStatus = status
        await booking.save()
        await sendBookingCancellation({ email: booking.user.email, userName: booking.user.name, bookingId: booking._id, hotelName: booking.hotel.name })
        res.status(200).json(new ApiResponse(200, null, "Status updated successfully"))

    }
})
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

        booking.bookingStatus = "cancelled";
        await booking.save();


        await sendBookingCancellation({ email: req.user.email, userName: req.user.name, bookingId: booking._id, hotelName: booking.hotel.name })

        res.status(200).json(new ApiResponse(200, null, "Booking cancelled successfully"));
    } catch (error) {
        res.status(500).json({ message: "Error cancelling booking", error: error.message, status: false });
    }
});
const checkRoomAvailability = asyncHandler(async (req, res) => {
    try {
        const { roomId, startDate, endDate } = req.body;

        console.log(req.body);

        const conflictingBookings = await HotelBooking.find({
            room: roomId,
            bookingStartDate: { $lte: new Date(endDate) },
            bookingEndDate: { $gte: new Date(startDate) },
            bookingStatus: { $ne: "cancelled" },
        });

        const isAvailable = conflictingBookings.length === 0;
        res.status(200).json({ isAvailable });
    } catch (error) {
        res.status(500).json({ message: "Error checking availability", error: error.message, status: false });
    }
});
export { checkRoomAvailability, createBooking, getUserBookings, getOwnerBookings, updateStatus, cancelBooking };