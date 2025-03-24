const { S3Client, CreateBucketCommand, PutBucketCorsCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

async function setupMinio() {
  console.log("Setting up MinIO...");

  const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: process.env.AWS_S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.MINIO_ROOT_USER,
      secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
    },
    forcePathStyle: true,
  });

  // Create bucket if it doesn't exist
  try {
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
      }),
    );
    console.log(`Bucket "${process.env.AWS_S3_BUCKET_NAME}" created`);
  } catch (err) {
    if (err.name === "BucketAlreadyExists" || err.name === "BucketAlreadyOwnedByYou") {
      console.log(`Bucket "${process.env.AWS_S3_BUCKET_NAME}" already exists`);
    } else {
      console.error("Error creating bucket:", err);
    }
  }

  // Configure CORS
  try {
    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
              AllowedOrigins: ["*"],
              ExposeHeaders: ["ETag"],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      }),
    );
    console.log("CORS configuration applied");
  } catch (err) {
    console.error("Error configuring CORS:", err);
  }
}

setupMinio().catch(console.error);
