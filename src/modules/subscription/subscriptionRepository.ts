import { db } from "@/db";
import { type SubscriptionStatus, subscriptions } from "@/db/schemas/subscription/subscription";
import { eq } from "drizzle-orm";

export type SubscriptionData = {
  userId: string;
  status: SubscriptionStatus;
  planType: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
};

export class SubscriptionRepository {
  async getSubscriptionByUserId(userId: string) {
    return db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string) {
    return db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
    });
  }

  async createOrUpdateSubscription(data: SubscriptionData) {
    const existing = await this.getSubscriptionByUserId(data.userId);

    if (existing) {
      const [updated] = await db
        .update(subscriptions)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, data.userId))
        .returning();

      return updated;
    } else {
      const [newSubscription] = await db
        .insert(subscriptions)
        .values({
          ...data,
        })
        .returning();

      return newSubscription;
    }
  }

  async updateSubscription(userId: string, data: Partial<SubscriptionData>) {
    const [updated] = await db
      .update(subscriptions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))
      .returning();

    return updated;
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string) {
    const existing = await this.getSubscriptionByUserId(userId);

    if (existing) {
      return this.updateSubscription(userId, { stripeCustomerId });
    } else {
      return this.createOrUpdateSubscription({
        userId,
        status: "active",
        planType: "free",
        stripeCustomerId,
      });
    }
  }

  async getUserActiveSubscription(userId: string) {
    const subscription = await this.getSubscriptionByUserId(userId);
    if (!subscription) return null;

    const isActive = ["active", "trialing"].includes(subscription.status);
    if (!isActive) return null;

    return subscription;
  }
}
