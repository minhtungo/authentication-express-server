import assertAuthentication from "@/middlewares/assertAuthentication";
import { validateRequest } from "@/utils/httpHandlers";
import { Router } from "express";
import { z } from "zod";
import { subscriptionController } from "./subscriptionController";

export const subscriptionRouter = Router();

// Apply authentication middleware to all subscription routes
subscriptionRouter.use(assertAuthentication);

// Create checkout session
subscriptionRouter.post(
  "/checkout",
  validateRequest(
    z.object({
      body: z.object({
        priceId: z.string(),
        returnUrl: z.string().url(),
      }),
    }),
  ),
  subscriptionController.createCheckoutSession,
);

// Get user subscription
subscriptionRouter.get("/", subscriptionController.getUserSubscription);

// Cancel subscription
subscriptionRouter.post("/cancel", subscriptionController.cancelSubscription);
