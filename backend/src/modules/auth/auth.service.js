import jwt from "jsonwebtoken";
import { generateOtp } from "./auth.utils.js";

export const authService = {
    generateToken: (payload) => {
        return jwt.sign(payload, process.env.SECRET_KEY);
    },
    createOtp: () => {
        return generateOtp();
    }
};
