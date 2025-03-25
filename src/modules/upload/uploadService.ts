import { env } from "@/config/env";
import { UploadRepository } from "@/modules/upload/uploadRepository";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { appConfig } from "@/config/appConfig";
import { ServiceResponse } from "@/lib/serviceResponse";
import { logger } from "@/utils/logger";
import { S3Client } from "@aws-sdk/client-s3";
import { StatusCodes } from "http-status-codes";
import { v4 as uuidv4 } from "uuid";

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

  async getPresignedUrl(filename?: string) {
    try {
      let key = uuidv4();

      if (filename) {
        const extension = filename.split(".").pop();
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
        id: key,
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
}

export const uploadService = new UploadService();
