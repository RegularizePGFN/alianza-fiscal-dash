
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
    // Basic input validation
    if (!options.html || !options.fileKey || !options.fileType) {
      throw new Error('Missing required parameters: html, fileKey or fileType');
    }
    
    // Validate fileType
    if (options.fileType !== 'pdf' && options.fileType !== 'png') {
      throw new Error('fileType must be either "pdf" or "png"');
    }
    
    // Try the primary API endpoint
    try {
      const response = await axios.post(RENDER_API_URL, options, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 45000 // 45 second timeout for rendering large documents
      });
      
      if (response.data && response.data.url) {
        return response.data;
      } else {
        throw new Error('Invalid response from rendering service');
      }
    } catch (apiError: any) {
      console.warn('Error with primary rendering API, trying fallback:', apiError.message);
      
      // Fallback to mock service for development/testing
      const mockResponse = await axios.post(MOCK_API_URL, options, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout for mock service
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
