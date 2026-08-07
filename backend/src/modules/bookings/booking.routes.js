import { Router } from "express";
import { cancelBooking, checkRoomAvailability, createBooking, getOwnerBookings, getUserBookings, updateStatus, getRoomBookingsByHotel, initiateRoomLock, getRefundPendingBookings, getRefundCompletedBookings, updateBookingToRefunded } from "./booking.controller.js";
import { verifyHotelOwner, verifyUser, verifyAdmin } from "../../middleware/auth.middleware.js";
import { cacheMiddleware } from "../../middleware/cache.middleware.js";

const hotelBookingRouter = Router();

hotelBookingRouter.route("/hotel-room-bookings/:hotelId").get(cacheMiddleware(120), getRoomBookingsByHotel);
hotelBookingRouter.route("/rooms/check-availability").post(verifyUser, checkRoomAvailability);
hotelBookingRouter.route("/rooms/lock").post(verifyUser, initiateRoomLock);
hotelBookingRouter.route("/").post(verifyUser, createBooking);
hotelBookingRouter.route("/hotel").get(verifyUser, cacheMiddleware(60), getUserBookings);
hotelBookingRouter.route("/get-hotel-bookings").get(verifyHotelOwner, cacheMiddleware(60), getOwnerBookings);
hotelBookingRouter.route("/cancel").post(verifyUser, cancelBooking);
hotelBookingRouter.route("/update-status").post(verifyHotelOwner, updateStatus);

// Admin Routes
hotelBookingRouter.route("/admin/refund-pending").get(verifyAdmin, getRefundPendingBookings);
hotelBookingRouter.route("/admin/refund-completed").get(verifyAdmin, getRefundCompletedBookings);
hotelBookingRouter.route("/admin/refund").post(verifyAdmin, updateBookingToRefunded);

export { hotelBookingRouter };
