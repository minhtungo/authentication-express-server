import { env } from "@/config/env";
import { ServiceResponse } from "@/lib/serviceResponse";
import { stripe, stripeService } from "@/services/stripe";
import { handleServiceResponse } from "@/utils/httpHandlers";
import { logger } from "@/utils/logger";
import type { Request, Response } from "express";
import type Stripe from "stripe";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return handleServiceResponse(ServiceResponse.failure("No signature provided", null), res);
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error(`Webhook Error: ${(err as Error).message}`);
    return handleServiceResponse(ServiceResponse.failure(`Webhook Error: ${(err as Error).message}`, null), res);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error("No user ID in session metadata");
        }
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
          metadata: { userId },
        });
        await stripeService.handleSubscriptionCreated(updatedSubscription);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await stripeService.handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await stripeService.handleSubscriptionUpdated(subscription);
        break;
      }
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return handleServiceResponse(ServiceResponse.success("Webhook received", null), res);
  } catch (error) {
    logger.error(`Error processing webhook: ${(error as Error).message}`);
    return handleServiceResponse(ServiceResponse.failure(`Server Error: ${(error as Error).message}`, null), res);
  }
};
