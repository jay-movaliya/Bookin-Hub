import jwt from "jsonwebtoken";

export const generateToken = (payload, expiresIn = "7d") => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY);
};
