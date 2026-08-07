import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import { userRouter } from "./modules/users/user.routes.js";
import { hotelOwnerRouter } from "./modules/owners/owner.routes.js";
import { hotelRatingRouter } from "./modules/reviews/review.routes.js";
import { hotelRouter } from "./modules/hotels/hotel.routes.js";
import { hotelBookingRouter } from "./modules/bookings/booking.routes.js";
import { paymentRouter } from "./modules/payments/payment.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { startBookingWorker } from "./workers/booking.worker.js";
import { startNotificationWorker } from "./workers/notification.worker.js";
import { startPaymentWorker } from "./workers/payment.worker.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Mount API routes
app.use("/api/user", userRouter);
app.use("/api/hotel/owner", hotelOwnerRouter);
app.use("/api/hotel-ratings", hotelRatingRouter);
app.use("/api/hotel", hotelRouter);
app.use("/api/booking", hotelBookingRouter);
app.use("/", paymentRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Bookin-Hub backend API");
});

// Error handling middleware
app.use(errorHandler);

// Start background cron workers
startBookingWorker();
startNotificationWorker();
startPaymentWorker();

export { app };