import { env } from "@/config/env";
import type { SubscriptionStatus } from "@/db/schemas";
import { SubscriptionRepository } from "@/modules/subscription/subscriptionRepository";
import { UserRepository } from "@/modules/user/userRepository";
import { logger } from "@/utils/logger";
import Stripe from "stripe";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
});

const subscriptionRepository = new SubscriptionRepository();
const userRepository = new UserRepository();

export const STRIPE_PLANS = {
  PRO: {
    name: "Pro",
    id: env.STRIPE_PRO_PRICE_ID,
    features: ["Unlimited conversations", "Access to advanced AI models", "Priority support", "File uploads"],
  },
};

export class StripeService {
  async createCheckoutSession(userId: string, planId: string, returnUrl: string) {
    try {
      const user = await userRepository.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      let stripeCustomerId = await this.getStripeCustomerId(userId);

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId,
          },
        });
        stripeCustomerId = customer.id;

        await subscriptionRepository.updateStripeCustomerId(userId, stripeCustomerId);
      }
      let session: Stripe.Checkout.Session | null = null;

      try {
        session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price: planId,
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${returnUrl}?canceled=true`,
          metadata: {
            userId,
          },
        });
      } catch (error) {
        console.log("testing", error);
      }

      return session;
    } catch (error) {
      logger.error("Error creating checkout session:", error);
      throw error;
    }
  }

  async getStripeCustomerId(userId: string): Promise<string | null> {
    try {
      const subscription = await subscriptionRepository.getSubscriptionByUserId(userId);
      return subscription?.stripeCustomerId || null;
    } catch (error) {
      logger.error("Error getting Stripe customer ID:", error);
      return null;
    }
  }

  async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      const userId = subscription.metadata.userId;
      if (!userId) {
        throw new Error("No user ID in subscription metadata");
      }
      console.log("subscription", userId);

      await subscriptionRepository.createOrUpdateSubscription({
        userId,
        status: subscription.status as SubscriptionStatus,
        planType: "pro",
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCustomerId: subscription.customer as string,
        currentPeriodStart: new Date(subscription.start_date * 1000),
        currentPeriodEnd: new Date(subscription.ended_at! * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      await userRepository.updateUserProfile(userId, { plan: "pro" });

      return true;
    } catch (error) {
      logger.error("Error handling subscription created:", error);
      throw error;
    }
  }

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      const userId = subscription.metadata.userId;

      if (!userId) {
        const existingSub = await subscriptionRepository.getSubscriptionByStripeId(subscription.id);
        if (!existingSub) {
          throw new Error("Cannot find user for subscription");
        }

        await subscriptionRepository.updateSubscription(existingSub.userId, {
          status: subscription.status as SubscriptionStatus,
          currentPeriodStart: new Date(subscription.start_date * 1000),
          currentPeriodEnd: new Date(subscription.ended_at! * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        if (subscription.status === "canceled" || subscription.status === "unpaid") {
          await userRepository.updateUserProfile(existingSub.userId, { plan: "free" });
        }
      }

      return true;
    } catch (error) {
      logger.error("Error handling subscription updated:", error);
      throw error;
    }
  }

  async cancelSubscription(userId: string) {
    try {
      const subscription = await subscriptionRepository.getSubscriptionByUserId(userId);

      if (!subscription?.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }

      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await subscriptionRepository.updateSubscription(userId, {
        cancelAtPeriodEnd: true,
      });

      return true;
    } catch (error) {
      logger.error("Error canceling subscription:", error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
