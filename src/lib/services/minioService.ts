
// minioService.ts - Browser compatible version
import axios from 'axios';

// URL to our MinIO proxy API 
const MINIO_API_URL = 'https://puppeteer-service.aliancafiscal.com.br/minio';
// Fallback URL for development/testing
const MOCK_API_URL = 'https://pdf-mock.aliancafiscal.com.br/minio';

const BUCKET_NAME = 'aliancafiscal';

// Convert string to Uint8Array for upload
const stringToUint8Array = (str: string) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Function to upload file to MinIO (via API proxy)
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
    
    // Create form data for multipart upload
    const formData = new FormData();
    const blob = new Blob([content], { type: contentType });
    formData.append('file', blob);
    formData.append('filePath', filePath);
    formData.append('contentType', contentType);
    formData.append('bucket', BUCKET_NAME);
    
    // Upload via our API proxy
    try {
      const response = await axios.post(MINIO_API_URL + '/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.url) {
        return response.data.url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (apiError) {
      console.warn('Error with primary API, trying fallback:', apiError);
      
      // Fallback to mock service for development/testing
      const mockResponse = await axios.post(MOCK_API_URL + '/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (mockResponse.data && mockResponse.data.url) {
        return mockResponse.data.url;
      } else {
        throw new Error('Invalid response from fallback server');
      }
    }
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
    // Request signed URL from our API proxy
    const response = await axios.get(MINIO_API_URL + '/signedUrl', {
      params: {
        bucket: BUCKET_NAME,
        filePath
      }
    });
    
    if (response.data && response.data.url) {
      return response.data.url;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error: any) {
    console.error('Error generating signed URL:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};
