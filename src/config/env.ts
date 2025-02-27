import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly("test"), choices: ["development", "production", "test"] }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  APP_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  BASE_URL: str({ devDefault: testOnly("http://localhost:8080") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  DATABASE_URL: str(),
  REDIS_URL: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_CALLBACK_URL: str(),
  EMAIL_SERVER_HOST: str(),
  EMAIL_SERVER_PORT: num(),
  EMAIL_SERVER_USER: str(),
  EMAIL_SERVER_PASSWORD: str(),
  EMAIL_FROM: str(),
  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),
  ACCESS_TOKEN_EXPIRES_IN: str(),
  REFRESH_TOKEN_EXPIRES_IN: str(),
  ACCESS_TOKEN_COOKIE_NAME: str(),
  REFRESH_TOKEN_COOKIE_NAME: str(),
});
