import { redis } from "@/lib/redis";
import { logger } from "@/utils/logger";

const KEY_PREFIX = "TOKEN_BLACKLIST:";

export const addTokenToBlacklist = async (sessionId: string, expiresInMs: number) => {
  try {
    const key = KEY_PREFIX + sessionId;
    await redis.set(key, "1", {
      PX: expiresInMs + 2 * 60 * 1000,
    });
  } catch (error) {
    logger.error(`Failed to add token to blacklist: ${error}`);
    throw error;
  }
};

export const checkTokenBlacklist = async (sessionId: string) => {
  try {
    const key = KEY_PREFIX + sessionId;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error(`Failed to check token blacklist: ${error}`);
    throw error;
  }
};
