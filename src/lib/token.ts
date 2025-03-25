import crypto from "node:crypto";
import { appConfig } from "@/config/appConfig";
import { env } from "@/config/env";
import type { AccessTokenPayload } from "@/types/token";
import { sign } from "jsonwebtoken";

export const generateToken = async (length = 32): Promise<string> => {
  const buffer = await crypto.randomBytes(Math.ceil(length * 0.75));

  return buffer.toString("base64url").slice(0, length);
};

export const generateAccessToken = (payload: AccessTokenPayload) => {
  return sign(payload, appConfig.token.accessToken.secret, {
    expiresIn: "30m",
    audience: env.APP_ORIGIN,
    issuer: env.BASE_URL,
  });
};

export const generateRefreshToken = async (
  userId: string,
): Promise<{
  token: string;
  expiresAt: Date;
  sessionId: string;
}> => {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + appConfig.token.refreshToken.expiresIn);

  const token = sign(
    {
      sub: userId,
      sessionId,
    },
    appConfig.token.refreshToken.secret,
    {
      expiresIn: appConfig.token.refreshToken.expiresIn,
    },
  );

  return {
    token,
    expiresAt,
    sessionId,
  };
};

export const hashToken = (token: string, secret: string): string => {
  if (!token) throw new Error("Token is required");

  return crypto.createHmac("sha512", secret).update(token).digest("hex");
};

export const compareTokens = (tokenA: string, tokenB: string, secret: string): boolean => {
  if (!tokenA || !tokenB) return false;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hashToken(tokenA, secret), "hex"),
      Buffer.from(hashToken(tokenB, secret), "hex"),
    );
  } catch {
    return false;
  }
};
