import { Router } from "express";
import { createPaymentOrder, verifyPaymentSignature } from "./payment.controller.js";
import { razorpayWebhook } from "./payment.webhook.js";

const paymentRouter = Router();

paymentRouter.post("/create-order", createPaymentOrder);
paymentRouter.post("/verify-payment", verifyPaymentSignature);
paymentRouter.post("/webhook", razorpayWebhook);

export { paymentRouter };
