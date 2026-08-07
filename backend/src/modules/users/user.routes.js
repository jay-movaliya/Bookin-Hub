import { Router } from "express";
import { loginUser, registerUser, verifyOtp, forgotPassword, resetPassword, updateProfilePic } from "./user.controller.js";
import { verifyUser } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import { dynamicRateLimiter } from "../../middleware/rateLimiter.middleware.js";

const userRouter = Router();

// Apply rate limiter to unauthenticated routes (will get the default 20 requests/min limit)
userRouter.route("/register").post(dynamicRateLimiter, registerUser);
userRouter.route("/verify-otp").post(dynamicRateLimiter, verifyOtp);
userRouter.route("/login").post(dynamicRateLimiter, loginUser);
userRouter.post("/forgot-password", dynamicRateLimiter, forgotPassword);
userRouter.post("/reset-password", dynamicRateLimiter, resetPassword);

// Apply rate limiter AFTER verifyUser (will check the user's role for dynamic limits)
userRouter.post("/update-profile-pic", verifyUser, dynamicRateLimiter, upload.single("profilePic"), updateProfilePic);

export { userRouter };
