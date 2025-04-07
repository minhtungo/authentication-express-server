import { pgEnum } from "drizzle-orm/pg-core";

export const roleSchema = pgEnum("role", ["member", "admin"]);
export const accountTypeSchema = pgEnum("type", ["email", "google", "facebook"]);
export const chatMessageRoleSchema = pgEnum("role", ["user", "assistant"]);
export const subscriptionStatusSchema = pgEnum("status", [
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "trialing",
  "unpaid",
]);
