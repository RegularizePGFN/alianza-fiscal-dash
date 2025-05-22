
import axios from 'axios';

// URL for our render API endpoint
const RENDER_API_URL = 'https://puppeteer-service.aliancafiscal.com.br/api/render-pdf';

// Fallback URL for development/testing
const MOCK_API_URL = 'https://pdf-mock.aliancafiscal.com.br/api/render-pdf';

interface RenderOptions {
  html: string;
  fileKey: string;
  fileType: 'pdf' | 'png';
  metadata?: Record<string, string>;
}

interface RenderResponse {
  url: string;
  fileKey: string;
}

/**
 * Sends HTML to the rendering service to generate PDF/PNG and upload to MinIO
 * 
 * @param options - Rendering options including HTML content and file metadata
 * @returns Promise with the URL to the rendered file
 */
export const renderAndUpload = async (options: RenderOptions): Promise<RenderResponse> => {
  try {
    // Try the primary API endpoint
    try {
      const response = await axios.post(RENDER_API_URL, options, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.url) {
        return response.data;
      } else {
        throw new Error('Invalid response from rendering service');
      }
    } catch (apiError) {
      console.warn('Error with primary rendering API, trying fallback:', apiError);
      
      // Fallback to mock service for development/testing
      const mockResponse = await axios.post(MOCK_API_URL, options, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (mockResponse.data && mockResponse.data.url) {
        return mockResponse.data;
      } else {
        throw new Error('Invalid response from fallback rendering service');
      }
    }
  } catch (error: any) {
    console.error('Error rendering and uploading file:', error);
    throw new Error(`Failed to render and upload file: ${error.message}`);
  }
};
