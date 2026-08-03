import { Router } from "express";
import { logineHotelOwner, registerHotelOwner, approveHotelOwner, rejectHotelOwner, getHotelOwner, getUnapprovedHotelOwner, verifyOtp, getApprovedHotelOwner, forgotPassword, resetPassword } from "../../controller/hotels/hotelOwner.controller.js";
import { verifyHotelOwner } from "../../middlewares/Hotels/verifyHotelOwner.middleware.js";
import { HotelOwner } from "../../models/hotels/hotelOwner.model.js";
import { verifyAdmin } from "../../middlewares/main/auth.middleware.js";
const hotelOwnerRouter = Router();


hotelOwnerRouter.route("/register").post(registerHotelOwner);
hotelOwnerRouter.route("/verify-otp").post(verifyOtp);
hotelOwnerRouter.route("/login").post(logineHotelOwner);
hotelOwnerRouter.route("/forgot-password").post(forgotPassword);
hotelOwnerRouter.route("/reset-password").post(resetPassword);

hotelOwnerRouter.route("/get-hotel-owner").get(verifyHotelOwner, getHotelOwner);

hotelOwnerRouter.route("/admin/get-owner").get(verifyAdmin, getHotelOwner);  // admin verification middleware missing!
hotelOwnerRouter.route("/admin/reject-owner").post(verifyAdmin, rejectHotelOwner);  // admin verification middleware missing!
hotelOwnerRouter.route("/admin/approve-owner").post(verifyAdmin, approveHotelOwner); // admin verification middleware missing!
hotelOwnerRouter.route("/admin/get-unapproved-hotel-owner").get(verifyAdmin, getUnapprovedHotelOwner);// admin verification middleware missing!
hotelOwnerRouter.route("/admin/get-approved-hotel-owner").get(verifyAdmin, getApprovedHotelOwner);// admin verification middleware missing!
export { hotelOwnerRouter };