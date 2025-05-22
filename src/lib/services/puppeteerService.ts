
import { ExtractedData } from '@/lib/types/proposals';
import { uploadFileToMinio, getProposalFilePath } from './minioService';
import { renderAndUpload } from './renderApiService';

// We'll use a remote Puppeteer service endpoint
const PUPPETEER_SERVICE_URL = 'https://puppeteer-service.aliancafiscal.com.br/render';

// For testing/development when the service is not available, use a mock URL
const MOCK_SERVICE_URL = 'https://pdf-mock.aliancafiscal.com.br/generate';

interface RenderResponse {
  pdf: string; // Base64 encoded PDF
  png: string; // Base64 encoded PNG
}

export interface ProposalFiles {
  pdfUrl: string;
  pngUrl: string;
  pdfPath: string;
  pngPath: string;
}

// Convert base64 to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  // Remove data URL prefix if present
  const base64String = base64.includes('base64,') 
    ? base64.split('base64,')[1] 
    : base64;
    
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
};

// Generate proposal files using the render API service
export const generateProposalFiles = async (
  htmlContent: string,
  data: Partial<ExtractedData>
): Promise<ProposalFiles> => {
  try {
    // Make sure we have a CNPJ, fallback to a timestamp if not available
    const identifier = data.cnpj ? data.cnpj : `temp_${Date.now()}`;
    
    // Prepare file paths
    const pdfPath = getProposalFilePath(identifier, 'pdf');
    const pngPath = getProposalFilePath(identifier, 'png');
    
    try {
      // Use our new render API service for PDF
      const pdfResult = await renderAndUpload({
        html: htmlContent,
        fileKey: pdfPath,
        fileType: 'pdf',
        metadata: {
          cnpj: data.cnpj || '',
          clientName: data.clientName || ''
        }
      });
      
      // Use our new render API service for PNG
      const pngResult = await renderAndUpload({
        html: htmlContent,
        fileKey: pngPath,
        fileType: 'png',
        metadata: {
          cnpj: data.cnpj || '',
          clientName: data.clientName || ''
        }
      });
      
      return {
        pdfUrl: pdfResult.url,
        pngUrl: pngResult.url,
        pdfPath,
        pngPath
      };
      
    } catch (serviceError) {
      console.warn('Render API service unavailable, falling back to client-side rendering:', serviceError);
      // If remote service fails, fallback to existing PDF generation method
      throw serviceError;
    }
  } catch (error) {
    console.error('Error generating proposal files:', error);
    throw new Error(`Failed to generate proposal files: ${error.message}`);
  }
};

// Fallback function using existing PDF generation approach with html2canvas and jsPDF
// This will be called if the Puppeteer service is unavailable
export const fallbackGenerateProposalFiles = async (
  element: HTMLElement,
  data: Partial<ExtractedData>
): Promise<ProposalFiles> => {
  try {
    // Import dependencies dynamically to reduce bundle size when not needed
    const { generateProposalPdf, generateProposalPng } = await import('@/lib/pdfUtils');
    
    // Use existing PDF and PNG generation methods
    const pdfBlob = await generateProposalPdf(element, data, true) as Blob;
    const pngBlob = await generateProposalPng(element, data, true) as Blob;
    
    // Convert blobs to Uint8Array
    const pdfArray = new Uint8Array(await pdfBlob.arrayBuffer());
    const pngArray = new Uint8Array(await pngBlob.arrayBuffer());
    
    // Prepare file paths
    const identifier = data.cnpj ? data.cnpj : `temp_${Date.now()}`;
    const pdfPath = getProposalFilePath(identifier, 'pdf');
    const pngPath = getProposalFilePath(identifier, 'png');
    
    // Upload files to MinIO
    const [pdfUrl, pngUrl] = await Promise.all([
      uploadFileToMinio(pdfArray, pdfPath, 'application/pdf'),
      uploadFileToMinio(pngArray, pngPath, 'image/png')
    ]);
    
    return { pdfUrl, pngUrl, pdfPath, pngPath };
  } catch (error) {
    console.error('Error in fallback proposal generation:', error);
    throw new Error(`Failed to generate proposal files with fallback method: ${error.message}`);
  }
};
