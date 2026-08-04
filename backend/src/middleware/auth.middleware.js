import { ApiError } from "../shared/ApiError.js";
import { asyncHandler } from "../shared/asyncHandler.js";
import { HotelOwner } from "../modules/owners/owner.model.js";
import jwt from "jsonwebtoken";

const verifyUser = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedinfo = jwt.verify(token, process.env.SECRET_KEY);

        if (!decodedinfo.user) {
            return res.status(401).json({ message: "Unauthorized Access! Please Log in.", status: false });
        }
        req.user = decodedinfo.user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token Expired');
        }

        throw new ApiError(404, error?.message);
    }
});

const verifyAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedinfo = jwt.verify(token, process.env.SECRET_KEY);

        if (decodedinfo.user && decodedinfo.user.type !== "admin") {
            throw new ApiError(403, "Access denied");
        }
        req.user = decodedinfo.user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token Expired');
        }

        throw new ApiError(404, error?.message);
    }
});

const verifyHotelOwner = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedinfo = jwt.verify(token, process.env.SECRET_KEY);

        let owner = await HotelOwner.findById(decodedinfo?._id).populate("user");
        if (!owner && decodedinfo?.user?._id) {
            owner = await HotelOwner.findOne({ user: decodedinfo.user._id }).populate("user");
        }

        if (!owner) {
            throw new ApiError(404, "Invalid Access Token");
        }
        req.hotel_owner = owner;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token Expired');
        }

        throw new ApiError(404, error?.message);
    }
});

export { verifyUser, verifyAdmin, verifyHotelOwner };
