import { roomRepository } from "./room.repository.js";

export const roomService = {
    getRoomById: (id) => roomRepository.findById(id),
    getRoomsByHotel: (hotelId) => roomRepository.find({ hotel: hotelId }),
    createRoom: (data) => roomRepository.create(data),
};
