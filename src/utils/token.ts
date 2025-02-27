import crypto from "node:crypto";
import { appConfig } from "@/config/appConfig";
import { sign } from "jsonwebtoken";

export const generateToken = async (length = 32): Promise<string> => {
  const buffer = await crypto.randomBytes(Math.ceil(length * 0.75));

  return buffer.toString("base64url").slice(0, length);
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  userId: string;
};

export const generateAccessToken = (payload: AccessTokenPayload) => {
  return sign(payload, appConfig.token.accessToken.secret, {
    expiresIn: "30m",
  });
};

export type RefreshTokenPayload = {
  sub: string;
};

export const generateRefreshToken = async (): Promise<{
  token: string;
  hashedToken: string;
  expiresAt: Date;
}> => {
  const token = await generateToken(64);
  const hashedToken = hashToken(token, appConfig.token.refreshToken.secret);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return {
    token,
    hashedToken,
    expiresAt,
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
