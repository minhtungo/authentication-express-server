import { env } from "@/config/env";
import { UploadRepository } from "@/modules/upload/uploadRepository";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { logger } from "@/utils/logger";
import { ServiceResponse } from "@/utils/serviceResponse";
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

  async getPresignedUrl() {
    try {
      const id = uuidv4();

      const { url, fields } = await createPresignedPost(this.s3Client, {
        Bucket: env.AWS_S3_BUCKET_NAME!,
        Key: id,
        Conditions: [
          ["content-length-range", 0, 5 * 1024 * 1024],
          // ["starts-with", "$Content-Type", "image/"],
        ],
        Expires: 600,
      });

      const finalUrl = env.USE_LOCAL_S3 ? `${env.AWS_S3_ENDPOINT}/${env.AWS_S3_BUCKET_NAME}/` : url;

      return ServiceResponse.success("Presigned URL created successfully", {
        url: finalUrl,
        fields,
        id,
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
