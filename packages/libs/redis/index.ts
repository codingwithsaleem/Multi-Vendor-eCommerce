import Redis, { Redis as RedisType } from "ioredis";

// Extend globalThis to include a Redis property for TypeScript
declare global {
  // eslint-disable-next-line no-var
  var redis: RedisType | undefined;
}

// Create or reuse Redis instance
const redis =
  globalThis.redis ??
  new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
  });

if (globalThis.redis) {
  console.log("♻️ Reusing existing Redis instance");
} else {
  console.log("🆕 Creating new Redis instance");
}

// Assign to globalThis only in development to avoid multiple connections during hot reload
if (process.env.NODE_ENV !== "production") {
  globalThis.redis = redis;
}

// Optional: log connection status
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redis;
