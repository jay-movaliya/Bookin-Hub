import { HotelOwner } from "./owner.model.js";

export const ownerRepository = {
    findByEmail: (email) => HotelOwner.findOne({ email }),
    findById: (id) => HotelOwner.findById(id),
    findAll: (query = {}) => HotelOwner.find(query),
    create: (data) => HotelOwner.create(data),
    updateById: (id, data) => HotelOwner.findByIdAndUpdate(id, data, { new: true }),
    deleteById: (id) => HotelOwner.findByIdAndDelete(id),
};
