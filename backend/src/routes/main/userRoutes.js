import { Router } from "express";
import { loginUser, registerUser, verifyOtp,getbookingByid, forgotPassword, resetPassword } from "../../controller/main/user.controller.js";
const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/verify-otp").post(verifyOtp);
userRouter.route("/login").post(loginUser);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);
userRouter.get("/getbooking/:id",getbookingByid);

export { userRouter };