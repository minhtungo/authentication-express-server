import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { subscriptions } from "./subscriptions";

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const subscriptionSchema = createSelectSchema(subscriptions);

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid";
