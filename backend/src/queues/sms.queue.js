import { Queue } from 'bullmq';

const connection = {
    url: process.env.REDIS_URI || 'redis://127.0.0.1:6379'
};

export const smsQueue = new Queue('sms-queue', { connection });

export const addSmsToQueue = async (data) => {
    try {
        await smsQueue.add('send-sms', data);
        console.log("SMS task queued:", data);
        return true;
    } catch (error) {
        console.error("Failed to add SMS to queue:", error);
        return false;
    }
};
