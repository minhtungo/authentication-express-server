import { verifyPassword } from "@/lib/password";
import { ServiceResponse } from "@/lib/serviceResponse";
import { SubscriptionRepository } from "@/modules/subscription/subscriptionRepository";
import type { UpdateUserSettings } from "@/modules/user/userModel";
import { UserRepository } from "@/modules/user/userRepository";
import { logger } from "@/utils/logger";
import { StatusCodes } from "http-status-codes";

export class UserService {
  private userRepository: UserRepository;
  private subscriptionRepository: SubscriptionRepository;

  constructor(
    userRepository: UserRepository = new UserRepository(),
    subscriptionRepository: SubscriptionRepository = new SubscriptionRepository(),
  ) {
    this.userRepository = userRepository;
    this.subscriptionRepository = subscriptionRepository;
  }

  async getMe(userId: string) {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
    }

    const userSettings = await this.userRepository.getUserSettingsByUserId(userId);
    const subscription = await this.subscriptionRepository.getSubscriptionByUserId(userId);

    const { password, ...userWithoutPassword } = user;

    // Check if currentPeriodEnd is valid (not null, not epoch start date)
    const hasValidPeriodEnd =
      subscription?.currentPeriodEnd && subscription.currentPeriodEnd.getTime() > new Date(0).getTime();

    const userWithSettings = {
      ...userWithoutPassword,
      settings: {
        isTwoFactorEnabled: userSettings?.isTwoFactorEnabled,
        theme: userSettings?.theme,
      },
      subscription: {
        planType: subscription?.planType || "free",
        status: subscription?.status || "active",
        currentPeriodStart: subscription?.currentPeriodStart,
        currentPeriodEnd: hasValidPeriodEnd ? subscription?.currentPeriodEnd : null,
        cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd || false,
      },
    };

    return ServiceResponse.success("User fetched successfully", userWithSettings, StatusCodes.OK);
  }

  async getUserById(id: string) {
    try {
      const user = await this.userRepository.getUserById(id);

      return ServiceResponse.success("User fetched successfully", user, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error getting presigned URL: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while getting presigned URL.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateProfile(userId: string, profileData: { name?: string; image?: string }) {
    try {
      const user = await this.userRepository.updateUserProfile(userId, profileData);

      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("Profile updated successfully", user, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error updating user profile: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating profile.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ServiceResponse> {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user || !user.password) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }

      const isPasswordValid = await verifyPassword(user.password, currentPassword);
      if (!isPasswordValid) {
        return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
      }

      if (currentPassword === newPassword) {
        return ServiceResponse.failure(
          "New password must be different from current password",
          null,
          StatusCodes.BAD_REQUEST,
        );
      }
      await this.userRepository.updateUserPassword(userId, newPassword);

      return ServiceResponse.success("Password changed successfully", null, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error changing password: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while changing password",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserSettings(userId: string, settingsData: UpdateUserSettings) {
    try {
      const existingSettings = await this.userRepository.getUserSettingsByUserId(userId);

      if (!existingSettings) {
        return ServiceResponse.failure("User settings not found", null, StatusCodes.NOT_FOUND);
      }

      const updatedSettings = await this.userRepository.updateUserSettings(userId, settingsData);

      return ServiceResponse.success("Settings updated successfully", updatedSettings, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error updating user settings: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while updating settings.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserSettings(userId: string) {
    try {
      const settings = await this.userRepository.getUserSettingsByUserId(userId);

      if (!settings) {
        return ServiceResponse.failure("User settings not found", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("Settings retrieved successfully", settings, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error retrieving user settings: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving settings.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const userService = new UserService();
