import { HotelBooking } from "./booking.model.js";

export const bookingRepository = {
    findById: (id) => HotelBooking.findById(id),
    find: (query = {}) => HotelBooking.find(query),
    create: (data) => HotelBooking.create(data),
    updateById: (id, data) => HotelBooking.findByIdAndUpdate(id, data, { new: true }),
    deleteById: (id) => HotelBooking.findByIdAndDelete(id),
};
