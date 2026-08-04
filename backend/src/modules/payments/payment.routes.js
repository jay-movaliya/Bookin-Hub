import { Router } from "express";
import { createPaymentOrder, verifyPaymentSignature } from "./payment.controller.js";

const paymentRouter = Router();

paymentRouter.post("/create-order", createPaymentOrder);
paymentRouter.post("/verify-payment", verifyPaymentSignature);

export { paymentRouter };
