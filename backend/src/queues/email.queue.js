import { Queue } from 'bullmq';

const connection = {
    url: process.env.REDIS_URI || 'redis://127.0.0.1:6379'
};

export const emailQueue = new Queue('email-queue', { connection });

export const addEmailToQueue = async (data) => {
    try {
        await emailQueue.add('send-email', data);
        console.log("Email task queued:", data);
        return true;
    } catch (error) {
        console.error("Failed to add Email to queue:", error);
        return false;
    }
};
