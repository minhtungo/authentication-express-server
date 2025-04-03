import { db } from "@/db";
import { type User, userSettings, users } from "@/db/schemas";
import { hashPassword } from "@/lib/password";
import type { UpdateProfile, UpdateUserSettings } from "@/modules/user/userModel";
import { eq } from "drizzle-orm";

export class UserRepository {
  async getUserById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async updateUserProfile(userId: string, data: Partial<User>) {
    const [updatedUser] = await db.update(users).set(data).where(eq(users.id, userId)).returning();

    return updatedUser;
  }

  async updateUserPassword(userId: string, newPassword: string) {
    const hashedPassword = await hashPassword(newPassword);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }

  async getUserSettingsByUserId(userId: string) {
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });

    return settings;
  }

  async updateUserSettings(userId: string, data: UpdateUserSettings) {
    const [updatedSettings] = await db
      .update(userSettings)
      .set(data)
      .where(eq(userSettings.userId, userId))
      .returning();

    return updatedSettings;
  }
}

export const userRepository = new UserRepository();
