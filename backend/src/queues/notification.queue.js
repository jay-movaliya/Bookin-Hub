import { Queue } from "bullmq";
import { getRedisClient } from '../config/redis.js';

const NOTIFICATION_QUEUE_NAME = "notifications";
let notificationQueue = null;

export function getNotificationQueue() {
    if (!notificationQueue) {
        notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
            connection: getRedisClient(),
            defaultJobOptions: {
                removeOnComplete: { age: 3600 },
                removeOnFail: { age: 86400 },
                attempts: 3,
                backoff: { type: "exponential", delay: 2000 },
            },
        });
        console.log(`[bullmq] queue "${NOTIFICATION_QUEUE_NAME}" ready`);
    }
    return notificationQueue;
}

/**
 * Enqueue a notification job.
 * @param {"email" | "sms"} channel - The communication channel
 * @param {"booking_confirmed_user" | "booking_confirmed_host" | "booking_cancelled_user" | "welcome_email" | "otp_email" | "otp_sms"} type
 * @param {object} data  - payload with recipient, booking details, etc.
 */
export async function enqueueNotification({ channel = 'email', type, data }) {
    const queue = getNotificationQueue();
    const job = await queue.add(type, { channel, type, data });
    console.log(`[bullmq] Notification task queued: [${channel}] ${type}`);
    return job.id;
}

export default getNotificationQueue;
