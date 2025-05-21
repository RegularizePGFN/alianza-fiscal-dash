
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { minioClient, MINIO_BUCKET } from './client';

/**
 * Upload a file to MinIO
 * @param key Path and filename for the file
 * @param buffer File content as buffer
 * @param contentType MIME type of the file
 * @returns URL to the uploaded file
 */
export async function uploadToMinio(key: string, buffer: Buffer | Uint8Array, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await minioClient.send(command);
  
  // Generate a signed URL that's valid for 7 days
  const url = await getSignedUrl(
    minioClient,
    new GetObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: key,
    }),
    { expiresIn: 604800 } // URL expires in 7 days
  );

  return url;
}

/**
 * Generate a signed URL for a file in MinIO
 * @param key File path and name in MinIO
 * @param expiresIn Seconds until URL expiration (default: 1 hour)
 * @returns Signed URL for file access
 */
export async function getMinioSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: MINIO_BUCKET,
    Key: key,
  });

  return getSignedUrl(minioClient, command, { expiresIn });
}
