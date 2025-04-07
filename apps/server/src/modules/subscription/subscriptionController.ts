import { handleServiceResponse } from "@/utils/httpHandlers";
import type { Request, Response } from "express";
import { subscriptionService } from "./subscriptionService";

class SubscriptionController {
  public createCheckoutSession = async (req: Request, res: Response) => {
    const { priceId, returnUrl } = req.body;
    const userId = req.user?.id!;

    const serviceResponse = await subscriptionService.createCheckoutSession(userId, priceId, returnUrl);
    handleServiceResponse(serviceResponse, res);
  };

  public getUserSubscription = async (req: Request, res: Response) => {
    const userId = req.user?.id!;

    const serviceResponse = await subscriptionService.getUserSubscription(userId);
    handleServiceResponse(serviceResponse, res);
  };

  public cancelSubscription = async (req: Request, res: Response) => {
    const userId = req.user?.id!;

    const serviceResponse = await subscriptionService.cancelSubscription(userId);
    handleServiceResponse(serviceResponse, res);
  };
}

export const subscriptionController = new SubscriptionController();
