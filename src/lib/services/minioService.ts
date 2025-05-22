
import { Client } from 'minio';

// MinIO client configuration
const minioClient = new Client({
  endPoint: 'minio.neumo.com.br',
  port: 443,
  useSSL: true,
  accessKey: 'bKUH7zI9pFv7feUTEMlp',
  secretKey: '8UQM0yEQz7yMDx2r50zhOCOqFbcToJInX78Sj63g'
});

const BUCKET_NAME = 'aliancafiscal';

// Convert string to Uint8Array for upload
const stringToUint8Array = (str: string) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Function to upload file to MinIO
export const uploadFileToMinio = async (
  fileContent: string | Uint8Array,
  filePath: string,
  contentType: string
): Promise<string> => {
  try {
    // Convert string to Uint8Array if it's a string
    const content = typeof fileContent === 'string' 
      ? stringToUint8Array(fileContent) 
      : fileContent;
    
    // Calculate content length
    const contentLength = content.byteLength;
    
    // Upload to MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      filePath,
      Buffer.from(content),
      contentLength,
      { 'Content-Type': contentType }
    );
    
    // Generate a presigned URL valid for 7 days (604800 seconds)
    const signedUrl = await minioClient.presignedGetObject(
      BUCKET_NAME,
      filePath,
      604800
    );
    
    return signedUrl;
  } catch (error: any) {
    console.error('Error uploading to MinIO:', error);
    throw new Error(`Failed to upload file to MinIO: ${error.message}`);
  }
};

// Function to get file path for proposal
export const getProposalFilePath = (
  cnpj: string,
  extension: 'pdf' | 'png'
): string => {
  const timestamp = new Date().getTime();
  const sanitizedCnpj = cnpj.replace(/[^\d]/g, ''); // Remove non-numeric characters
  return `propostas/${sanitizedCnpj}/${timestamp}_proposta.${extension}`;
};

// Function to generate signed URL for an existing file
export const getSignedUrl = async (
  filePath: string
): Promise<string> => {
  try {
    // Generate a presigned URL valid for 7 days (604800 seconds)
    const signedUrl = await minioClient.presignedGetObject(
      BUCKET_NAME,
      filePath,
      604800
    );
    return signedUrl;
  } catch (error: any) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};
