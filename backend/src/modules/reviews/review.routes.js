import { Router } from "express";
import { submitRating, getrating, getHotelRatingsPublic } from "./review.controller.js";
import { verifyHotelOwner } from "../../middleware/auth.middleware.js";

const hotelRatingRouter = Router();

hotelRatingRouter.get('/', verifyHotelOwner, getrating);
hotelRatingRouter.get('/:hotelId', getHotelRatingsPublic);
hotelRatingRouter.post('/submit', submitRating);

export { hotelRatingRouter };
