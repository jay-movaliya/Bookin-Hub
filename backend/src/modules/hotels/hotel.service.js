import { hotelRepository } from "./hotel.repository.js";

export const hotelService = {
    getHotelById: (id) => hotelRepository.findById(id),
    getAllHotels: (query) => hotelRepository.find(query),
    createHotel: (data) => hotelRepository.create(data),
};
