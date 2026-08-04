import { Router } from "express";
import { submitRating, getrating } from "./review.controller.js";
import { verifyHotelOwner } from "../../middleware/auth.middleware.js";

const hotelRatingRouter = Router();

hotelRatingRouter.get('/', verifyHotelOwner, getrating);
hotelRatingRouter.post('/submit', submitRating);

export { hotelRatingRouter };
