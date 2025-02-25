import { StatusCodes } from "http-status-codes";

import { AuthRepository } from "@/api/auth/authRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { createTransaction } from "@/common/utils/transaction";

export class AuthService {
  private authRepository: AuthRepository;

  constructor(repository: AuthRepository = new AuthRepository()) {
    this.authRepository = repository;
  }

  async signUp(email: string, password: string) {
    const existingUser = await this.authRepository.getUserByEmail(email);

    if (existingUser) {
      if (existingUser.emailVerified) {
        return ServiceResponse.success(
          "If your email is not registered, you will receive a verification email shortly.",
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

          // try {
          //   await emailService.sendVerificationEmail(email, existingUser.name!, newToken);
          // } catch (emailError) {
          //   throw new Error(`Failed to send verification email: ${emailError}`);
          // }
        });
      }

      return ServiceResponse.success(
        "If your email is not registered, you will receive a verification email shortly.",
        null,
        StatusCodes.OK,
      );
    }
  }
}

export const authService = new AuthService();
