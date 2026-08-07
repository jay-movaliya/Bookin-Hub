import { Redis } from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let client = null;

/**
 * Returns a singleton Redis client.
 * Lazily connects on first access so the app can boot without Redis.
 */
export function getRedisClient() {
  if (!client) {
    client = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      retryStrategy(times) {
        // Reconnect every 5 s up to 10 tries, then give up.
        if (times > 10) return null;
        return Math.min(times * 100, 5000);
      },
      maxRetriesPerRequest: null, // required by BullMQ
      enableReadyCheck: false,
    });

    client.on("error", (err) => {
      console.error("[redis] connection error:", err.message);
    });

    client.on("ready", () => {
      console.log(`[redis] connected to ${REDIS_HOST}:${REDIS_PORT}`);
    });
  }
  return client;
}

/**
 * Gracefully close the Redis connection.
 */
export async function closeRedis() {
  if (client) {
    await client.quit();
    client = null;
    console.log("[redis] connection closed");
  }
}

export default getRedisClient;
