import dotenv from "dotenv";
import { bool, cleanEnv, host, num, port, str, testOnly } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  // Common
  NODE_ENV: str({ devDefault: testOnly("test"), choices: ["development", "production", "test"] }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(3000) }),
  // App
  APP_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  BASE_URL: str({ devDefault: testOnly("http://localhost:8080") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  // Database
  DATABASE_URL: str(),
  REDIS_URL: str(),
  REDIS_PORT: port(),
  // Auth
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_CALLBACK_URL: str(),
  // Email
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
  // OpenAI
  OPENAI_API_KEY: str(),
  // S3
  USE_LOCAL_S3: bool({ devDefault: testOnly(true) }),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_REGION: str(),
  AWS_S3_BUCKET_NAME: str(),
  AWS_S3_ENDPOINT: str(),
  AWS_S3_PORT: port(),
  // MinIO
  MINIO_ROOT_USER: str(),
  MINIO_ROOT_PASSWORD: str(),
  // Stripe
  STRIPE_SECRET_KEY: str(),
  STRIPE_WEBHOOK_SECRET: str(),
  STRIPE_PRO_PRICE_ID: str(),
});
