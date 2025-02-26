import crypto from "node:crypto";
import { appConfig } from "@/config/appConfig";
import { sign } from "jsonwebtoken";

export const generateToken = async (length = 32): Promise<string> => {
  const buffer = await crypto.randomBytes(Math.ceil(length * 0.75));

  return buffer.toString("base64url").slice(0, length);
};

export const generateSecureToken = async (length = 32): Promise<{ token: string; hashedToken: string }> => {
  const token = await generateToken(length);
  const hashedToken = hashToken(token);

  return { token, hashedToken };
};

export const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateRandomCode = async (length = 8): Promise<string> => {
  const bytesNeeded = Math.ceil(length * 0.75);

  // Generate random bytes
  const buffer = await crypto.randomBytes(bytesNeeded);

  let result = "";

  // Convert random bytes to numbers
  for (const byte of buffer) {
    // Use modulo 10 to get single digits (0-9)
    result += byte % 10;

    if (result.length >= length) {
      break;
    }
  }

  return result.slice(0, length).padStart(length, "0");
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

export const generateRefreshToken = (payload: RefreshTokenPayload) => {
  return sign(payload, appConfig.token.refreshToken.secret, {
    expiresIn: "7d",
  });
};
