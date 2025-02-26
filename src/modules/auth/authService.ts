import { StatusCodes } from "http-status-codes";

import { AuthRepository } from "@/modules/auth/authRepository";
import { logger } from "@/server";
import { emailService } from "@/services/email/emailService";
import { ServiceResponse } from "@/utils/serviceResponse";
import { createTransaction } from "@/utils/transaction";

export class AuthService {
  private authRepository: AuthRepository;

  constructor(repository: AuthRepository = new AuthRepository()) {
    this.authRepository = repository;
  }

  async signUp(email: string, password: string): Promise<ServiceResponse> {
    try {
      const existingUser = await this.authRepository.getUserByEmail(email);

      if (existingUser) {
        if (existingUser.emailVerified) {
          return ServiceResponse.success(
            "If your email is not registered, you will receive a verification email shortly",
            null,
            StatusCodes.OK,
          );
        }

        const existingToken = await this.authRepository.getVerificationTokenByUserId(existingUser.id);

        if (existingToken && existingToken.expires < new Date()) {
          await createTransaction(async (trx) => {
            // Delete old token
            await this.authRepository.deleteVerificationTokenByToken(existingToken.token, trx);

            // Create new token
            const newToken = await this.authRepository.createVerificationEmailToken(existingUser.id!, trx);

            await emailService.sendVerificationEmail(email, existingUser.name!, newToken);

            return ServiceResponse.success(
              "If your email is not registered, you will receive a verification email shortly",
              null,
              StatusCodes.OK,
            );
          });
        }
      }

      await createTransaction(async (trx) => {
        const newUser = await this.authRepository.createUser({ email, password }, trx);

        const verificationToken = await this.authRepository.createVerificationEmailToken(newUser.id!, trx);

        await emailService.sendVerificationEmail(email, newUser.name!, verificationToken);
      });

      return ServiceResponse.success(
        "If your email is not registered, you will receive a verification email shortly",
        null,
        StatusCodes.OK,
      );
    } catch (ex) {
      const errorMessage = `Error signing up: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while signing up.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async verifyEmail(token: string): Promise<ServiceResponse> {
    try {
      const existingToken = await this.authRepository.getVerificationTokenByToken(token);

      if (!existingToken || existingToken.expires < new Date()) {
        return ServiceResponse.failure("Invalid token", null, StatusCodes.BAD_REQUEST);
      }

      await createTransaction(async (trx) => {
        await this.authRepository.updateUserEmailVerified(existingToken.userId, trx);
        await this.authRepository.deleteVerificationTokenByToken(token, trx);
      });

      return ServiceResponse.success("Email verified", null, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error verifying email: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while verifying email",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async forgotPassword(email: string): Promise<ServiceResponse> {
    try {
      const user = await this.authRepository.getUserByEmail(email);

      if (!user || !user.emailVerified || !user.id) {
        return ServiceResponse.success(
          "If a matching account is found, a password reset email will be sent to you shortly",
          null,
          StatusCodes.OK,
        );
      }

      const resetPasswordToken = await this.authRepository.createResetPasswordToken(user.id);

      await emailService.sendPasswordResetEmail(email, user.name!, resetPasswordToken);

      return ServiceResponse.success(
        "If a matching account is found, a password reset email will be sent to you shortly",
        null,
        StatusCodes.OK,
      );
    } catch (ex) {
      const errorMessage = `Error forgetting password: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while forgetting password",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(token: string, password: string): Promise<ServiceResponse> {
    try {
      const existingToken = await this.authRepository.getResetPasswordTokenByToken(token);

      if (!existingToken || existingToken.expires < new Date()) {
        return ServiceResponse.failure("Invalid token", null, StatusCodes.BAD_REQUEST);
      }

      await createTransaction(async (trx) => {
        await this.authRepository.updateUserPassword(existingToken.userId, password, trx);
        await this.authRepository.deleteResetPasswordTokenByToken(token, trx);
      });

      return ServiceResponse.success("Password reset successfully", null, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error resetting password: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while resetting password",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const authService = new AuthService();
