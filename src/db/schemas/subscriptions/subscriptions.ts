import { subscriptionStatusSchema } from "@/db/schemas/constants";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "../users";

export const subscriptions = pgTable("subscriptions", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: subscriptionStatusSchema("status").default("active"),
  planType: text().notNull().default("free"),

  stripeCustomerId: text(),
  stripeSubscriptionId: text(),
  stripePriceId: text(),

  currentPeriodStart: timestamp({ mode: "date" }),
  currentPeriodEnd: timestamp({ mode: "date" }),

  cancelAtPeriodEnd: boolean().default(false),

  createdAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp({ mode: "date" })
    .notNull()
    .$defaultFn(() => new Date()),
});
