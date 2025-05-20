
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
    
    // Check for error response from the edge function
    if (data.error) {
      console.error('Erro retornado pela API:', data.error);
      throw new Error(data.error);
    }
    
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
    // Mensagem de erro mais amigável e informativa
    if (error instanceof Error) {
      // Tratar erros específicos de forma amigável
      if (error.message.includes('API key')) {
        throw new Error('Chave de API da OpenAI não configurada ou inválida. Verifique as configurações.');
      } else if (error.message.includes('timeout') || error.message.includes('demorou')) {
        throw new Error('A análise demorou muito tempo. Tente novamente com uma imagem menor ou mais clara.');
      } else if (error.message.includes('content_policy')) {
        throw new Error('A imagem não parece ser uma proposta PGFN válida.');
      } else {
        throw new Error(`Erro na análise com IA: ${error.message}`);
      }
    }
    throw new Error('Erro desconhecido na análise da imagem. Você pode continuar com a entrada manual de dados.');
  }
};

// Re-export types for convenience
export * from './types';
