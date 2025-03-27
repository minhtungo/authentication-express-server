import { db } from "@/db";
import { type InsertFileUpload, fileUploads } from "@/db/schemas/fileUploads";
import { desc, eq } from "drizzle-orm";

export class UploadRepository {
  async createFileUpload(data: InsertFileUpload) {
    const [newFileUpload] = await db.insert(fileUploads).values(data).returning();
    return newFileUpload;
  }

  async getFileUploadsByUserId(userId: string, offset = 0, limit = 30) {
    const uploads = await db.query.fileUploads.findMany({
      where: eq(fileUploads.userId, userId),
      orderBy: (fileUploads) => [desc(fileUploads.createdAt)],
      offset,
      limit,
    });
    return uploads;
  }

  async getFileUploadById(id: string) {
    const fileUpload = await db.query.fileUploads.findFirst({
      where: eq(fileUploads.id, id),
    });
    return fileUpload;
  }

  async deleteFileUpload(id: string) {
    await db.delete(fileUploads).where(eq(fileUploads.id, id));
  }
}

export const uploadRepository = new UploadRepository();
