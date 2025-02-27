import { env } from "@/config/env";

export const appConfig = {
  verificationEmailToken: {
    length: 48,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
  resetPasswordToken: {
    length: 48,
    maxAge: 1000 * 60 * 10,
  },
  token: {
    accessToken: {
      cookieName: env.ACCESS_TOKEN_COOKIE_NAME,
      secret: env.ACCESS_TOKEN_SECRET,
      expiresIn: 30 * 60 * 1000,
    },
    refreshToken: {
      cookieName: env.REFRESH_TOKEN_COOKIE_NAME,
      secret: env.REFRESH_TOKEN_SECRET,
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    },
  },
};
