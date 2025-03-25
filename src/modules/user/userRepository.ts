import { db } from "@/db";
import { users } from "@/db/schemas";
import { eq } from "drizzle-orm";

export class UserRepository {
  async getUserById(id: string) {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }
}

export const userRepository = new UserRepository();
