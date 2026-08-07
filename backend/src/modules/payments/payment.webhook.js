import crypto from "crypto";
import { addPaymentToQueue } from "../../queues/payment.queue.js";

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

            if (event === "payment.captured" || event === "order.paid") {
                await addPaymentToQueue({ event, payload: req.body.payload });
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
