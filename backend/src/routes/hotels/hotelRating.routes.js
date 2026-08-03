import { Router } from "express";
import { submitRating, getrating } from "../../controller/hotels/hotelRating.controller.js";
import { verifyHotelOwner } from "../../middlewares/Hotels/verifyHotelOwner.middleware.js";
const hotelRatingRouter = Router();

// routes.js
hotelRatingRouter.get('/', verifyHotelOwner, getrating)
hotelRatingRouter.post('/submit', submitRating)
export { hotelRatingRouter }