import { Router } from "express";
import { cancelBooking, checkRoomAvailability, createBooking, getOwnerBookings, getUserBookings, updateStatus, getRoomBookingsByHotel } from "./booking.controller.js";
import { verifyHotelOwner, verifyUser } from "../../middleware/auth.middleware.js";

const hotelBookingRouter = Router();

hotelBookingRouter.route("/hotel-room-bookings/:hotelId").get(getRoomBookingsByHotel);
hotelBookingRouter.route("/rooms/check-availability").post(verifyUser, checkRoomAvailability);
hotelBookingRouter.route("/").post(verifyUser, createBooking);
hotelBookingRouter.route("/hotel").get(verifyUser, getUserBookings);
hotelBookingRouter.route("/get-hotel-bookings").get(verifyHotelOwner, getOwnerBookings);
hotelBookingRouter.route("/cancel").post(verifyUser, cancelBooking);
hotelBookingRouter.route("/update-status").post(verifyHotelOwner, updateStatus);

export { hotelBookingRouter };
