import { env } from "@/config/env";
import { UploadRepository } from "@/modules/upload/uploadRepository";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { appConfig } from "@/config/appConfig";
import { ServiceResponse } from "@/lib/serviceResponse";
import { logger } from "@/utils/logger";
import { getFileUrl } from "@/utils/upload";
import { S3Client } from "@aws-sdk/client-s3";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

export const DEFAULT_GET_USER_UPLOADS_OFFSET = 0;
export const DEFAULT_GET_USER_UPLOADS_LIMIT = 30;

export class UploadService {
  private uploadRepository: UploadRepository;
  private s3Client: S3Client;

  constructor(repository: UploadRepository = new UploadRepository()) {
    this.uploadRepository = repository;
    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      ...(env.USE_LOCAL_S3 && {
        endpoint: env.AWS_S3_ENDPOINT,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      }),
    });
  }

  async getPresignedUrl(fileName?: string) {
    try {
      let key = uuidv4();

      if (fileName) {
        const extension = fileName.split(".").pop();
        if (extension) {
          key = `${key}.${extension}`;
        }
      }

      const { url, fields } = await createPresignedPost(this.s3Client, {
        Bucket: env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Conditions: [
          ["content-length-range", 0, appConfig.upload.maxFileSize],
          // ["starts-with", "$Content-Type", "image/"],
        ],
        Expires: appConfig.upload.presignedUrl.expiresIn,
      });

      const finalUrl = env.USE_LOCAL_S3 ? `${env.AWS_S3_ENDPOINT}/${env.AWS_S3_BUCKET_NAME}/` : url;

      return ServiceResponse.success("Presigned URL created successfully", {
        url: finalUrl,
        fields,
        key,
        fileName: fileName || "unnamed",
      });
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

  async confirmUpload(data: { key: string; fileName: string; mimeType: string; size?: number }, userId: string) {
    try {
      const fileUrl = getFileUrl(data.key);

      const fileUpload = await this.uploadRepository.createFileUpload({
        key: data.key,
        fileName: data.fileName,
        mimeType: data.mimeType,
        size: data.size?.toString(),
        url: fileUrl,
        userId,
      });

      console.log(fileUpload);

      return ServiceResponse.success("File upload recorded successfully", fileUpload);
    } catch (ex) {
      const errorMessage = `Error confirming upload: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while confirming the upload.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserUploads(
    userId: string,
    offset: number = DEFAULT_GET_USER_UPLOADS_OFFSET,
    limit: number = DEFAULT_GET_USER_UPLOADS_LIMIT,
  ) {
    try {
      const uploads = await this.uploadRepository.getFileUploadsByUserId(userId, offset, limit + 1);
      const hasNextPage = uploads.length > limit;
      const paginatedUploads = hasNextPage ? uploads.slice(0, limit) : uploads;
      const nextOffset = hasNextPage ? offset + limit : null;

      return ServiceResponse.success("User uploads retrieved successfully", {
        uploads: paginatedUploads,
        hasNextPage,
        nextOffset,
      });
    } catch (ex) {
      const errorMessage = `Error getting user uploads: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving uploads.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUpload(fileId: string, userId: string) {
    try {
      const fileUpload = await this.uploadRepository.getFileUploadById(fileId);

      if (!fileUpload) {
        return ServiceResponse.failure("File not found", null, StatusCodes.NOT_FOUND);
      }

      if (fileUpload.userId !== userId) {
        return ServiceResponse.failure("Unauthorized", null, StatusCodes.FORBIDDEN);
      }

      await this.uploadRepository.deleteFileUpload(fileId);

      return ServiceResponse.success("File deleted successfully", null);
    } catch (ex) {
      const errorMessage = `Error deleting file: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while deleting the file.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUploads(fileIds: string[], userId: string) {
    try {
      // Process each file deletion and collect results
      const results = await Promise.all(
        fileIds.map(async (fileId) => {
          try {
            const fileUpload = await this.uploadRepository.getFileUploadById(fileId);

            if (!fileUpload) {
              return { fileId, success: false, error: "File not found" };
            }

            if (fileUpload.userId !== userId) {
              return { fileId, success: false, error: "Unauthorized" };
            }

            await this.uploadRepository.deleteFileUpload(fileId);
            return { fileId, success: true };
          } catch (error) {
            return { fileId, success: false, error: (error as Error).message };
          }
        }),
      );

      const successful = results.filter((r) => r.success).map((r) => r.fileId);
      const failed = results
        .filter((r) => !r.success)
        .map((r) => ({
          fileId: r.fileId,
          error: r.error,
        }));

      return ServiceResponse.success(`Successfully deleted ${successful.length} of ${fileIds.length} files`, {
        successful,
        failed,
      });
    } catch (ex) {
      const errorMessage = `Error deleting files: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while deleting files.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export const uploadService = new UploadService();
