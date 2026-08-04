import { Router } from "express";
import { logineHotelOwner, registerHotelOwner, getOwnerProfile, approveHotelOwner, rejectHotelOwner, getHotelOwner, getUnapprovedHotelOwner, verifyOtp, getApprovedHotelOwner, forgotPassword, resetPassword } from "./owner.controller.js";
import { verifyHotelOwner } from "../../middleware/auth.middleware.js";
import { verifyAdmin } from "../../middleware/auth.middleware.js";

const hotelOwnerRouter = Router();

hotelOwnerRouter.route("/register").post(registerHotelOwner);
hotelOwnerRouter.route("/verify-otp").post(verifyOtp);
hotelOwnerRouter.route("/login").post(logineHotelOwner);
hotelOwnerRouter.route("/forgot-password").post(forgotPassword);
hotelOwnerRouter.route("/reset-password").post(resetPassword);
hotelOwnerRouter.route("/profile").get(verifyHotelOwner, getOwnerProfile);

hotelOwnerRouter.route("/get-hotel-owner").get(verifyHotelOwner, getHotelOwner);

hotelOwnerRouter.route("/admin/get-owner").get(verifyAdmin, getHotelOwner);
hotelOwnerRouter.route("/admin/reject-owner").post(verifyAdmin, rejectHotelOwner);
hotelOwnerRouter.route("/admin/approve-owner").post(verifyAdmin, approveHotelOwner);
hotelOwnerRouter.route("/admin/get-unapproved-hotel-owner").get(verifyAdmin, getUnapprovedHotelOwner);
hotelOwnerRouter.route("/admin/get-approved-hotel-owner").get(verifyAdmin, getApprovedHotelOwner);

export { hotelOwnerRouter };
