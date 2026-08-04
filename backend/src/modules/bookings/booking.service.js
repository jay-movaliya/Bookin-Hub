import { bookingRepository } from "./booking.repository.js";

export const bookingService = {
    getBookingById: (id) => bookingRepository.findById(id),
    getUserBookings: (userId) => bookingRepository.find({ user: userId }),
    createBooking: (data) => bookingRepository.create(data),
};
