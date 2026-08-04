import { HotelRoom } from "./room.model.js";

export const roomRepository = {
    findById: (id) => HotelRoom.findById(id),
    find: (query = {}) => HotelRoom.find(query),
    create: (data) => HotelRoom.create(data),
    updateById: (id, data) => HotelRoom.findByIdAndUpdate(id, data, { new: true }),
    deleteById: (id) => HotelRoom.findByIdAndDelete(id),
};
