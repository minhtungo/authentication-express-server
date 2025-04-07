import { StatusCodes } from "http-status-codes";

import { appConfig } from "@/config/appConfig";
import { env } from "@/config/env";
import { verifyPassword } from "@/lib/password";
import { ServiceResponse } from "@/lib/serviceResponse";
import { generateAccessToken, generateRefreshToken } from "@/lib/token";
import { AuthRepository } from "@/modules/auth/authRepository";
import { emailService } from "@/services/email/emailService";
import { addTokenToBlacklist, checkTokenBlacklist } from "@/services/redis/tokenBlacklist";
import type { RefreshTokenPayload } from "@/types/token";
import { logger } from "@/utils/logger";
import { createTransaction } from "@/utils/transaction";
import type { Response } from "express";
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
  ): Promise<{
    refreshToken: string;
    serviceResponse: ServiceResponse<{ accessToken: string; convertedUser: { id: string } } | null>;
  }> {
    try {
      const user = await this.authRepository.getUserByEmail(email);

      if (!user || !user.emailVerified || !user.id || !user.password) {
        return {
          refreshToken: "",
          serviceResponse: ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED),
        };
      }

      const isPasswordValid = await verifyPassword(user.password, password);
      if (!isPasswordValid) {
        return {
          refreshToken: "",
          serviceResponse: ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED),
        };
      }

      const userSettings = await this.authRepository.getUserSettingsByUserId(user.id);

      if (userSettings?.isTwoFactorEnabled) {
        const isValidTwoFactor = await this.validateTwoFactorCode(user.id, email, code);
        if (!isValidTwoFactor) {
          return {
            refreshToken: "",
            serviceResponse: ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED),
          };
        }
      }

      const { token: refreshToken, sessionId } = await generateRefreshToken(user.id);

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        userId: user.id,
        sessionId,
      });

      return {
        refreshToken,
        serviceResponse: ServiceResponse.success(
          "Signed in successfully",
          {
            accessToken,
            convertedUser: {
              id: user.id,
            },
          },
          StatusCodes.OK,
        ),
      };
    } catch (ex) {
      const errorMessage = `Error signing in: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return {
        refreshToken: "",
        serviceResponse: ServiceResponse.failure(
          "An error occurred while signing in.",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR,
        ),
      };
    }
  }

  async signOut(refreshToken: string): Promise<ServiceResponse> {
    try {
      const payload = verify(refreshToken, appConfig.token.refreshToken.secret) as RefreshTokenPayload;
      await addTokenToBlacklist(payload.sessionId, appConfig.token.refreshToken.expiresIn);
      return ServiceResponse.success("Signed out successfully", null, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error signing out: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while signing out.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  private async validateTwoFactorCode(userId: string, email: string, code?: string): Promise<boolean> {
    if (!code) {
      const twoFactorConfirmation = await this.authRepository.getTwoFactorConfirmationByUserId(userId);
      if (!twoFactorConfirmation) {
        return false;
      }
      await this.authRepository.deleteTwoFactorConfirmation(twoFactorConfirmation.id!);
      return true;
    }

    const twoFactorToken = await this.authRepository.getTwoFactorTokenByEmail(email);

    if (!twoFactorToken || twoFactorToken.token !== code || new Date(twoFactorToken.expires) < new Date()) {
      return false;
    }

    await createTransaction(async (trx) => {
      await this.authRepository.deleteTwoFactorTokenByToken(twoFactorToken.token, trx);
      await this.authRepository.createTwoFactorConfirmation(userId, trx);
    });

    return true;
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

  async refreshToken(refreshToken: string): Promise<{
    refreshToken: string;
    serviceResponse: ServiceResponse<{ accessToken: string; userId: string } | null>;
  }> {
    if (!refreshToken) {
      return {
        refreshToken: "",
        serviceResponse: ServiceResponse.failure("Refresh token not found", null, StatusCodes.UNAUTHORIZED),
      };
    }
    try {
      const payload = verify(refreshToken, appConfig.token.refreshToken.secret) as RefreshTokenPayload;

      const isBlacklisted = await checkTokenBlacklist(payload.sessionId);
      if (isBlacklisted) {
        return {
          refreshToken: "",
          serviceResponse: ServiceResponse.failure("Token has been revoked", null, StatusCodes.UNAUTHORIZED),
        };
      }

      const user = await this.authRepository.getUserById(payload.sub);

      if (!user) {
        return {
          refreshToken: "",
          serviceResponse: ServiceResponse.failure("User not found", null, StatusCodes.UNAUTHORIZED),
        };
      }
      const { token: newRefreshToken, sessionId } = await generateRefreshToken(user.id);

      const accessToken = generateAccessToken({
        sub: user.id,
        email: user.email,
        userId: user.id,
        sessionId,
      });

      // Blacklist the old session
      await addTokenToBlacklist(payload.sessionId, appConfig.token.refreshToken.expiresIn);

      return {
        refreshToken: newRefreshToken,
        serviceResponse: ServiceResponse.success("Token refreshed", { accessToken, userId: user.id }, StatusCodes.OK),
      };
    } catch (ex) {
      const errorMessage = `Error refreshing token: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return {
        refreshToken: "",
        serviceResponse: ServiceResponse.failure("Invalid refresh token", null, StatusCodes.UNAUTHORIZED),
      };
    }
  }

  setRefreshTokenToCookie(res: Response, refreshToken: string) {
    res.cookie(appConfig.token.refreshToken.cookieName, refreshToken, {
      httpOnly: env.NODE_ENV === "production",
      secure: env.NODE_ENV === "production",
      expires: new Date(Date.now() + appConfig.token.refreshToken.expiresIn),
      path: "/",
      sameSite: "lax",
    });
  }
}

export const authService = new AuthService();
