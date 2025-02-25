import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schemas',
  out: './migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
