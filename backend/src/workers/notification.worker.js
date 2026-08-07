import { Worker } from "bullmq";
import { 
    sendBookingConfirmation, 
    sendBookingCancellation, 
    sendWelcomeEmail, 
    sendOtpEmail,
    sendRefundNotification 
} from "../services/email.service.js";
import { getRedisClient } from '../config/redis.js';

const NOTIFICATION_QUEUE_NAME = "notifications";

export const startNotificationWorker = () => {
    const worker = new Worker(
        NOTIFICATION_QUEUE_NAME,
        async (job) => {
            const { channel, type, data } = job.data;
            console.log(`[notification-worker] processing job ${job.id} — channel: ${channel}, type: ${type}`);

            if (channel === "sms") {
                // Future implementation for actual SMS gateway (e.g., Twilio)
                console.log(`[SMS] Sending ${type} SMS to ${data.phoneNumber || data.contact}: ${data.message || 'OTP SMS'}`);
                return;
            }

            // Fallback to email if channel is "email" or undefined
            switch (type) {
                case "booking_confirmed_user":
                    await sendBookingConfirmation(data);
                    break;
                case "booking_cancelled_user":
                    await sendBookingCancellation(data);
                    break;
                case "welcome_email":
                    await sendWelcomeEmail(data);
                    break;
                case "otp_email":
                    await sendOtpEmail(data);
                    break;
                case "booking_refunded_user":
                    await sendRefundNotification(data);
                    break;
                default:
                    console.warn(`[notification-worker] Unknown notification type: ${type}`);
            }
        },
        {
            connection: getRedisClient(),
            concurrency: 5,
        }
    );

    worker.on("completed", (job) => {
        console.log(`[notification-worker] job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        console.error(`[notification-worker] job ${job?.id} failed:`, err.message);
    });

    worker.on("error", (err) => {
        if (err.message && !err.message.includes("ECONNREFUSED")) {
            console.error("[notification-worker] unexpected error:", err.message);
        }
    });

    console.log("[notification-worker] started — waiting for jobs...");
    return worker;
};
