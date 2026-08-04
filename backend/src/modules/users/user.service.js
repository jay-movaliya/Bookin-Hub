import { userRepository } from "./user.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userService = {
    registerUser: async (userData) => {
        const existedUser = await userRepository.findByEmail(userData.email);
        if (existedUser) {
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        return userRepository.create({
            ...userData,
            password: hashedPassword,
        });
    },
    findUserByEmail: async (email) => {
        return userRepository.findByEmail(email);
    },
    findUserById: async (id) => {
        return userRepository.findById(id);
    }
};
