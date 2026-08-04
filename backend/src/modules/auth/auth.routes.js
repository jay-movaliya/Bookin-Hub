import { Router } from "express";
import { registerUser, loginUser, verifyOtp, forgotPassword, resetPassword } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/verify-otp", verifyOtp);
// (forgot password) send otp to user for forgot password
authRouter.post("/forgot-password", forgotPassword);
// (reset password) update new password when user forgets password using otp
authRouter.post("/reset-password", resetPassword);

export { authRouter };
