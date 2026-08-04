import { User } from "./user.model.js";

export const userRepository = {
    findByEmail: (email) => User.findOne({ email }),
    findById: (id) => User.findById(id),
    create: (userData) => User.create(userData),
    updateById: (id, updateData) => User.findByIdAndUpdate(id, updateData, { new: true }),
    deleteById: (id) => User.findByIdAndDelete(id),
};
