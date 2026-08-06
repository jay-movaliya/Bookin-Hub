import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URI || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect immediately
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Initial Redis connection error:', err);
    }
})();

export const redisService = {
    get: async (key) => {
        try {
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis Get Error:', error);
            return null;
        }
    },
    set: async (key, value, ttlInSeconds = 300) => {
        try {
            await redisClient.set(key, JSON.stringify(value), {
                EX: ttlInSeconds
            });
            return true;
        } catch (error) {
            console.error('Redis Set Error:', error);
            return false;
        }
    },
    del: async (key) => {
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error('Redis Del Error:', error);
            return false;
        }
    },
};

export default redisClient;
