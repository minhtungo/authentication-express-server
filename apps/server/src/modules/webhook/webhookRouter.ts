import { handleStripeWebhook } from "@/modules/webhook/webhookController";
import { Router } from "express";
import express from "express";

export const webhookRouter = Router();

webhookRouter.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);
