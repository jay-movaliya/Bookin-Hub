import { Router } from "express";
import { registerUser, loginUser, verifyOtp, forgotPassword, resetPassword } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export { authRouter };
