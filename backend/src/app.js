import express, { application } from "express"
import cors from "cors"
import crypto from "crypto";

import cookieParser from "cookie-parser"
import { userRouter } from "./routes/main/userRoutes.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();
import "./services/hotel/completeBookingCron.js"
const app = express()

app.use(cors({
  origin: 'http://localhost:5173',  // Specify the exact origin of your front-end
  credentials: true,               // Allow credentials (cookies, authorization headers)
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser());

app.use("/api/user", userRouter)

//------------HOTEL ROUTES-------------------------------------

import { hotelOwnerRouter } from "./routes/hotels/hotelOwner.routes.js"
app.use("/api/hotel/owner", hotelOwnerRouter)

import { hotelRatingRouter } from "./routes/hotels/hotelRating.routes.js";
app.use("/api/hotel-ratings", hotelRatingRouter)
import { hotelRouter } from "./routes/hotels/hotel.routes.js"
app.use("/api/hotel", hotelRouter)

import { hotelBookingRouter } from "./routes/hotels/hotelBooking.routes.js";
app.use("/api/booking", hotelBookingRouter)

// ------------------------------------------------------------


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Create Razorpay Order
app.post("/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const options = {
      amount: amount, // Convert to paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    console.log("Befor Order")
    const order = await razorpay.orders.create(options);
    console.log("after Order")
    res.json({ success: true, order });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
});


// ✅ Verify Payment Signature
app.post("/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    res.json({ success: true, message: "Payment verified successfully!" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});
app.get("/", (req, res) => {
  res.send("Welcome to the backend");
})


export { app }