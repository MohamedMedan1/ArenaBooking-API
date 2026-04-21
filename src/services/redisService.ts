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
};
