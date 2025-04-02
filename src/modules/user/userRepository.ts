import { db } from "@/db";
import { users } from "@/db/schemas";
import type { UpdateProfile } from "@/modules/user/userModel";
import { eq } from "drizzle-orm";

export class UserRepository {
  async getUserById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }

  async updateUserProfile(userId: string, data: UpdateProfile) {
    const [updatedUser] = await db.update(users).set(data).where(eq(users.id, userId)).returning();

    return updatedUser;
  }
}

export const userRepository = new UserRepository();
