import { StatusCodes } from "http-status-codes";

import { appConfig } from "@/config/appConfig";
import { AuthRepository } from "@/modules/auth/authRepository";
import { logger } from "@/server";
import { emailService } from "@/services/email/emailService";
import { verifyPassword } from "@/utils/password";
import { ServiceResponse } from "@/utils/serviceResponse";
import { generateAccessToken } from "@/utils/token";
import { createTransaction } from "@/utils/transaction";
import { verify } from "jsonwebtoken";

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
        const newUser = await this.authRepository.createUser({ email, password, name: email }, trx);

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

  async signIn(
    email: string,
    password: string,
    code?: string,
  ): Promise<ServiceResponse<{ accessToken: string; userId: string } | null>> {
    try {
      const user = await this.authRepository.getUserByEmail(email);

      if (!user || !user.emailVerified || !user.id || !user.password) {
        return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
      }

      const isPasswordValid = await verifyPassword(user.password, password);

      if (!isPasswordValid) {
        return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
      }

      const userSettings = await this.authRepository.getUserSettingsByUserId(user.id);

      if (userSettings?.isTwoFactorEnabled) {
        if (code) {
          const twoFactorToken = await this.authRepository.getTwoFactorTokenByEmail(email);

          if (!twoFactorToken || twoFactorToken.token !== code) {
            return ServiceResponse.failure("Invalid two-factor code", null, StatusCodes.UNAUTHORIZED);
          }
          if (new Date(twoFactorToken.expires) < new Date()) {
            return ServiceResponse.failure("Code expired", null, StatusCodes.UNAUTHORIZED);
          }

          await createTransaction(async (trx) => {
            await this.authRepository.deleteTwoFactorTokenByToken(twoFactorToken.token, trx);
            await this.authRepository.createTwoFactorConfirmation(user.id!, trx);
          });
        } else {
          const twoFactorConfirmation = await this.authRepository.getTwoFactorConfirmationByUserId(user.id!);

          if (!twoFactorConfirmation) {
            return ServiceResponse.failure("Invalid two-factor code", null, StatusCodes.UNAUTHORIZED);
          }

          await this.authRepository.deleteTwoFactorConfirmation(twoFactorConfirmation.id!);
        }
      }

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        userId: user.id,
      });

      return ServiceResponse.success("Signed in successfully", { accessToken, userId: user.id }, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error signing in: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while signing in.", null, StatusCodes.INTERNAL_SERVER_ERROR);
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

  async refreshToken(refreshToken: string): Promise<ServiceResponse<{ accessToken: string; userId: string } | null>> {
    if (!refreshToken) {
      return ServiceResponse.failure("Refresh token not found", null, StatusCodes.UNAUTHORIZED);
    }
    try {
      const decodedToken = verify(refreshToken, appConfig.token.refreshToken.secret);

      if (!decodedToken) {
        return ServiceResponse.failure("Invalid refresh token", null, StatusCodes.UNAUTHORIZED);
      }

      const user = await this.authRepository.getUserById(decodedToken.sub as string);

      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.UNAUTHORIZED);
      }

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        userId: user.id,
      });

      return ServiceResponse.success("Token refreshed", { accessToken, userId: user.id }, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error refreshing token: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("Invalid refresh token", null, StatusCodes.UNAUTHORIZED);
    }
  }
}

export const authService = new AuthService();
