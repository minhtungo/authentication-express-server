import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { subscriptions } from "./subscription";

export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const subscriptionSchema = createSelectSchema(subscriptions);

export type InsertSubscription = typeof subscriptions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
