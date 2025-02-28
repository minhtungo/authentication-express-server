import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { createClient } from "redis";

const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (err) => logger.error("Redis Client Error", err));
redisClient.on("connect", () => logger.info("Redis Client Connected"));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    throw error;
  }
};

export const redis = redisClient;
