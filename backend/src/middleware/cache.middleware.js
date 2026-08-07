import { getRedisClient } from '../config/redis.js';

const redisClient = getRedisClient();

export const cacheMiddleware = (ttlSeconds = 120) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Make the cache key user-specific if the route is authenticated
        const key = req.user 
            ? `cache:${req.user._id}:${req.originalUrl}` 
            : `cache:${req.originalUrl}`;

        try {
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                console.log(`Cache HIT for ${key}`);
                return res.status(200).json(JSON.parse(cachedResponse));
            }

            console.log(`Cache MISS for ${key}`);

            // Intercept res.json to cache the response before sending it
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                // Only cache successful responses (status 200-299)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redisClient.setex(key, ttlSeconds, JSON.stringify(body))
                        .catch(err => console.error("Redis SetEx Error:", err));
                }
                return originalJson(body);
            };

            next();
        } catch (error) {
            console.error("Cache Middleware Error:", error);
            next(); // Proceed without cache if Redis fails
        }
    };
};
