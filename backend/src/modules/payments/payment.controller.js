import { paymentService } from "./payment.service.js";

export const createPaymentOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const order = await paymentService.createOrder(amount, currency);
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
            res.json({ success: true, message: "Payment verified successfully!" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
