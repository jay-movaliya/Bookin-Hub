import { getRedisClient } from '../config/redis.js';

/**
 * A basic Fixed Window rate limiter middleware using Redis.
 * 
 * @param {Object} options 
 * @param {number} options.windowMs - Timeframe for the rate limit in milliseconds
 * @param {number | function} options.max - Maximum number of requests allowed in the windowMs, or a function returning the max
 * @param {string} options.message - Error message to send when rate limit is exceeded
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // Default 1 minute
    max = 100,            // Default 100 requests per minute
    message = 'Too many requests, please try again later.'
  } = options;

  return async (req, res, next) => {
    try {
      const redisClient = getRedisClient();

      // Identify the user by their ID (if authenticated) or IP address
      const identifier = req.user?.id || req.ip;
      const key = `rate_limit:${identifier}`;

      // Increment the request count for this key
      const currentRequests = await redisClient.incr(key);

      if (currentRequests === 1) {
        // If this is the first request, set the expiration (TTL) in milliseconds
        await redisClient.pexpire(key, windowMs);
      } else {
        // Safety check: ensure the key has an expiration set, in case it was missed
        const ttl = await redisClient.pttl(key);
        if (ttl === -1) {
          await redisClient.pexpire(key, windowMs);
        }
      }

      // Allow max to be a function (to determine limits dynamically based on roles)
      const maxLimit = typeof max === 'function' ? await max(req) : max;

      console.log(`Rate limit check: ${key} -> ${currentRequests}/${maxLimit}`);

      // If the number of requests exceeds the limit, block the request
      if (currentRequests > maxLimit) {
        return res.status(429).json({
          success: false,
          message: message,
        });
      }

      // Otherwise, allow the request to proceed
      next();
    } catch (error) {
      console.error('Rate Limiter Error:', error);
      // Fallback: If Redis is down, allow the request to pass to avoid breaking the app
      next();
    }
  };
};

/**
 * A pre-configured dynamic rate limiter that checks the user's role.
 * Assumes that an authentication middleware has already run and populated `req.user`.
 */
export const dynamicRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  max: (req) => {
    // 1. If user is an Admin, allow 1000 requests per minute
    if (req.user && req.user.role === 'admin') {
      return 1000;
    } else if (req.user && req.user.role === 'hotelowner') {
      // 2. If user is a hotelowner, allow 500 requests per minute
      return 500;
    } else if (req.user && req.user.role === 'customer') {
      // 3. If it's a customer, allow 100 requests per minute
      return 100;
    }
    // 4. If it's a guest / unauthenticated user, allow only 20 requests per minute
    return 20;
  },
  message: 'You have exceeded your allowed request limit based on your role.'
});