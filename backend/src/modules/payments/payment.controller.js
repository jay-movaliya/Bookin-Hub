import { paymentService } from "./payment.service.js";
import { getRedisClient } from "../../config/redis.js";
import { addPaymentToQueue } from "../../queues/payment.queue.js";

export const createPaymentOrder = async (req, res) => {
    try {
        const { amount, currency, bookingId } = req.body;
        const order = await paymentService.createOrder(amount, currency);
        
        if (bookingId) {
            // Map Razorpay order_id -> tempBookingId in Redis for 5 minutes
            const redisClient = getRedisClient();
            await redisClient.setex(`rzp_order:${order.id}`, 300, bookingId);
        }

        res.json({ success: true, order });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyPaymentSignature = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const isValid = paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (isValid) {
            // Immediately process payment so local dev doesn't require ngrok webhooks
            await addPaymentToQueue({
                event: "payment.captured",
                payload: {
                    payment: {
                        entity: {
                            id: razorpay_payment_id,
                            order_id: razorpay_order_id
                        }
                    }
                }
            });

            res.json({ success: true, message: "Payment verified successfully!" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
