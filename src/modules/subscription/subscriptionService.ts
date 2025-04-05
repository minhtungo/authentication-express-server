import { ServiceResponse } from "@/lib/serviceResponse";
import { SubscriptionRepository } from "@/modules/subscription/subscriptionRepository";
import { UserRepository } from "@/modules/user/userRepository";
import { stripeService } from "@/services/stripe";
import { logger } from "@/utils/logger";
import { StatusCodes } from "http-status-codes";

class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;
  private userRepository: UserRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
    this.userRepository = new UserRepository();
  }

  async createCheckoutSession(userId: string, planId: string, returnUrl: string) {
    try {
      const session = await stripeService.createCheckoutSession(userId, planId, returnUrl);

      return ServiceResponse.success(
        "Checkout session created successfully",
        { url: session?.url, sessionId: session?.id },
        StatusCodes.OK,
      );
    } catch (error) {
      logger.error("Error creating checkout session:", error);
      return ServiceResponse.failure("Failed to create checkout session", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserSubscription(userId: string) {
    try {
      const subscription = await this.subscriptionRepository.getSubscriptionByUserId(userId);
      const user = await this.userRepository.getUserById(userId);

      return ServiceResponse.success(
        "Subscription retrieved successfully",
        {
          subscription,
          plan: user?.plan || "free",
        },
        StatusCodes.OK,
      );
    } catch (error) {
      logger.error("Error retrieving subscription:", error);
      return ServiceResponse.failure("Failed to retrieve subscription", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelSubscription(userId: string) {
    try {
      await stripeService.cancelSubscription(userId);

      return ServiceResponse.success("Subscription canceled successfully", null, StatusCodes.OK);
    } catch (error) {
      logger.error("Error canceling subscription:", error);
      return ServiceResponse.failure("Failed to cancel subscription", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const subscriptionService = new SubscriptionService();
