import { env } from "@/config/env";

export const getFileUrl = (key: string) => {
  const baseUrl = env.USE_LOCAL_S3
    ? `${env.AWS_S3_ENDPOINT}/${env.AWS_S3_BUCKET_NAME}/`
    : `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/`;

  return `${baseUrl}${key}`;
};

export async function convertFileUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64 = buffer.toString("base64");

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Error converting attachment", error);
    throw error;
  }
}
