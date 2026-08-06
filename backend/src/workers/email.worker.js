import { Worker } from 'bullmq';
import { sendWelcomeEmail } from '../services/email.service.js';

const connection = {
    url: process.env.REDIS_URI || 'redis://127.0.0.1:6379'
};

export const processEmailQueue = async () => {
    const worker = new Worker('email-queue', async (job) => {
        const { type, email, userName } = job.data;
        if (type === 'welcome') {
            await sendWelcomeEmail({ email, userName });
        }
    }, { connection });

    worker.on('completed', (job) => {
        console.log(`Email Job ${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
        console.log(`Email Job ${job.id} has failed with ${err.message}`);
    });

    console.log("Email worker active...");
};
