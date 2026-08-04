import Hotel from "./hotel.model.js";

export const hotelRepository = {
    findById: (id) => Hotel.findById(id),
    find: (query = {}) => Hotel.find(query),
    create: (data) => Hotel.create(data),
    updateById: (id, data) => Hotel.findByIdAndUpdate(id, data, { new: true }),
    deleteById: (id) => Hotel.findByIdAndDelete(id),
};
