import { verifyPassword } from "@/lib/password";
import { ServiceResponse } from "@/lib/serviceResponse";
import { UserRepository } from "@/modules/user/userRepository";
import { logger } from "@/utils/logger";
import { StatusCodes } from "http-status-codes";

export class UserService {
  private userRepository: UserRepository;

  constructor(repository: UserRepository = new UserRepository()) {
    this.userRepository = repository;
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
}

export const userService = new UserService();
