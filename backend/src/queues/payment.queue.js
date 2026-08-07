import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis.js';

export const paymentQueue = new Queue('payment-queue', { connection: getRedisClient() });

export const addPaymentToQueue = async (data) => {
    try {
        await paymentQueue.add('process-payment', data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000
            }
        });
        console.log("Payment task queued:", data.event);
        return true;
    } catch (error) {
        console.error("Failed to add payment task to queue:", error);
        return false;
    }
};
