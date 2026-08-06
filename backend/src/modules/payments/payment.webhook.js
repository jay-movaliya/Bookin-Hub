import crypto from "crypto";
import { HotelBooking } from "../bookings/booking.model.js";

export const razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        if (!signature || !secret) {
            return res.status(400).json({ message: "Missing signature or webhook secret" });
        }

        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (digest === signature) {
            const event = req.body.event;

            // Handle both payment.captured and order.paid just in case
            if (event === "payment.captured" || event === "order.paid") {
                const orderId = req.body.payload.payment.entity.order_id;
                
                if (orderId) {
                    await HotelBooking.findOneAndUpdate(
                        { razorpay_order_id: orderId },
                        { paymentStatus: "completed" }
                    );
                }
            }

            res.status(200).json({ status: "ok" });
        } else {
            res.status(400).json({ status: "error", message: "Invalid signature" });
        }
    } catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};
