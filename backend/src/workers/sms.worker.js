import { Worker } from 'bullmq';
import { sendSms } from '../services/sms.service.js';

const connection = {
    url: process.env.REDIS_URI || 'redis://127.0.0.1:6379'
};

export const processSmsQueue = async () => {
    const worker = new Worker('sms-queue', async (job) => {
        const { phoneNumber, message } = job.data;
        await sendSms({ phoneNumber, message });
    }, { connection });

    worker.on('completed', (job) => {
        console.log(`SMS Job ${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
        console.log(`SMS Job ${job.id} has failed with ${err.message}`);
    });

    console.log("SMS worker active...");
};
