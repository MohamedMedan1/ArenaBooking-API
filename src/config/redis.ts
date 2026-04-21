import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
};

export const redis = new Redis(redisConfig);

redis.on("connect", () => console.log("🚀 Redis Connected..."));
redis.on("error", (err) => console.error("❌ Redis Error:", err));
