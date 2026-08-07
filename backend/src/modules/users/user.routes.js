import { Router } from "express";
import { loginUser, registerUser, verifyOtp, forgotPassword, resetPassword, updateProfilePic } from "./user.controller.js";
import { verifyUser } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/verify-otp").post(verifyOtp);
userRouter.route("/login").post(loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.post("/update-profile-pic", verifyUser, upload.single("profilePic"), updateProfilePic);

export { userRouter };
