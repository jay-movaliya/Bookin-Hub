import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HotelOwner } from "../../models/hotels/hotelOwner.model.js";
import jwt from "jsonwebtoken";

const verifyHotelOwner = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedinfo = await jwt.verify(token, process.env.SECRET_KEY)

        const owner = await HotelOwner.findById(decodedinfo?._id)

        if (!owner) {
            throw new ApiError(404, "Invalid Access Token")
        }
        req.hotel_owner = owner
        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token Expired');
        }

        throw new ApiError(404, error?.message)
    }
})

export { verifyHotelOwner };