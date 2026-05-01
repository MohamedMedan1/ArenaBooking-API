import { redis } from "../config/redis";

export const cacheService = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      console.error("Redis Get Error:", err);
      return null;
    }
  },

  set: async (key: string, value: any, expireInSeconds: number) => {
    try {
      await redis.set(key, JSON.stringify(value), "EX", expireInSeconds);
    } catch (err) {
      console.error("Redis Set Error:", err);
    }
  },

  delete: async (key: string) => {
    try {
      await redis.del(key);
    } catch (err) {
      console.error("Redis Delete Error:", err);
    }
  },

deleteByPattern: async (pattern: string) => {
  try {
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });

    await new Promise<void>((resolve, reject) => {
      stream.on("data", async (keys: string[]) => {
        if (keys.length > 0) {
          stream.pause();
          
          const pipeline = redis.pipeline();
          keys.forEach((key) => pipeline.del(key));
          await pipeline.exec();
          
          stream.resume();
        }
      });

      stream.on("end", () => resolve());
      stream.on("error", (err) => reject(err));
    });
  } catch (err) {
    console.error("Redis deleteByPattern Error:", err);
  }
}};
