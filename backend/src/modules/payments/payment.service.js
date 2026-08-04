import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

export const paymentService = {
    createOrder: async (amount, currency = "INR") => {
        const instance = getRazorpayInstance();
        const options = {
            amount: amount,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
        };
        return await instance.orders.create(options);
    },
    verifySignature: (orderId, paymentId, signature) => {
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");
        return generatedSignature === signature;
    }
};
