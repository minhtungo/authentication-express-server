import { appConfig } from "@/config/appConfig";
import { db } from "@/db";
import { resetPasswordTokens, userSettings, verificationTokens } from "@/db/schemas";
import { type User, users } from "@/db/schemas/users";
import { hashPassword } from "@/utils/password";
import { generateToken } from "@/utils/token";
import { eq } from "drizzle-orm";

export class AuthRepository {
  async getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user;
  }

  async getVerificationTokenByUserId(userId: string) {
    const token = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.userId, userId),
    });

    return token;
  }

  async getVerificationTokenByToken(token: string) {
    const verificationToken = await db.query.verificationTokens.findFirst({
      where: eq(verificationTokens.token, token),
    });

    return verificationToken;
  }

  async deleteVerificationTokenByToken(token: string, trx: typeof db = db) {
    await trx.delete(verificationTokens).where(eq(verificationTokens.token, token));
  }

  async deleteResetPasswordTokenByToken(token: string, trx: typeof db = db) {
    await trx.delete(resetPasswordTokens).where(eq(resetPasswordTokens.token, token));
  }

  async createVerificationEmailToken(userId: string, trx: typeof db = db) {
    const token = await generateToken(appConfig.verificationEmailToken.length);
    const expires = new Date(Date.now() + appConfig.verificationEmailToken.maxAge);

    await trx
      .insert(verificationTokens)
      .values({
        userId,
        token,
        expires,
      })
      .onConflictDoUpdate({
        target: verificationTokens.id,
        set: {
          token,
          expires,
        },
      });

    return token;
  }

  async createResetPasswordToken(userId: string, trx: typeof db = db) {
    const token = await generateToken(appConfig.resetPasswordToken.length);
    const expires = new Date(Date.now() + appConfig.resetPasswordToken.maxAge);

    await trx
      .insert(resetPasswordTokens)
      .values({
        userId,
        token,
        expires,
      })
      .onConflictDoUpdate({
        target: resetPasswordTokens.id,
        set: {
          token,
          expires,
        },
      });

    return token;
  }

  async getResetPasswordTokenByToken(token: string) {
    const resetPasswordToken = await db.query.resetPasswordTokens.findFirst({
      where: eq(resetPasswordTokens.token, token),
    });

    return resetPasswordToken;
  }

  async createUser(
    {
      email,
      password: plainPassword,
    }: {
      email: string;
      password: string;
    },
    trx: typeof db = db,
  ): Promise<User> {
    const password = plainPassword ? await hashPassword(plainPassword) : undefined;

    const [newUser] = await trx.insert(users).values({ email, password, name: email }).returning();

    await trx.insert(userSettings).values({
      userId: newUser.id,
    });

    return newUser;
  }

  async updateUserEmailVerified(userId: string, trx: typeof db = db) {
    await trx.update(users).set({ emailVerified: new Date() }).where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, password: string, trx: typeof db = db) {
    const hashedPassword = await hashPassword(password);
    await trx.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }
}
