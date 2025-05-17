
/**
 * Service for analyzing images using OpenAI's vision models
 */
import { ExtractedData } from '@/lib/types/proposals';
import { sendImageToAnalysis } from './api';
import { mapAIResponseToExtractedData } from './utils';
import { AIAnalysisResponse } from './types';

/**
 * Analyzes an image using AI vision capabilities
 * 
 * @param imageBase64 - Image in base64 format
 * @param progressCallback - Callback for progress updates
 * @returns Extracted data from the image
 */
export const analyzeImageWithAI = async (
  imageBase64: string, 
  progressCallback: (progress: number) => void,
  updateStatus: (status: string) => void
): Promise<Partial<ExtractedData>> => {
  try {
    progressCallback(10);
    
    updateStatus('Enviando imagem para GPT-4o via Supabase...');
    
    progressCallback(30);
    
    // Send the image to the API
    const data = await sendImageToAnalysis(imageBase64);
    
    if (!data.jsonContent) {
      console.error('Resposta sem JSON:', data);
      throw new Error('A resposta não contém dados estruturados');
    }
    
    progressCallback(70);
    
    const aiResponse: AIAnalysisResponse = JSON.parse(data.jsonContent);
    console.log('Resposta da AI processada com sucesso:', aiResponse);
    
    // Map the AI response to our application format
    const extractedData = mapAIResponseToExtractedData(aiResponse);

    progressCallback(100);
    return extractedData;
    
  } catch (error) {
    console.error('Erro na análise da imagem com IA:', error);
    throw error;
  }
};

// Re-export types for convenience
export * from './types';
