
import { S3Client } from '@aws-sdk/client-s3';

// MinIO client configuration
export const minioClient = new S3Client({
  endpoint: 'https://minio.neumo.com.br',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'bKUH7zI9pFv7feUTEMlp',
    secretAccessKey: '8UQM0yEQz7yMDx2r50zhOCOqFbcToJInX78Sj63g',
  },
  forcePathStyle: true, // Required for MinIO
});

export const MINIO_BUCKET = 'aliancafiscal';
