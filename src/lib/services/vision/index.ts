
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
    console.log('=== INICIANDO ANÁLISE DE IMAGEM ===');
    console.log('analyzeImageWithAI: Iniciando análise');
    progressCallback(10);
    
    updateStatus('Enviando imagem para GPT-4o via Supabase...');
    
    progressCallback(30);
    
    console.log('analyzeImageWithAI: Enviando para API');
    // Send the image to the API
    const data = await sendImageToAnalysis(imageBase64);
    
    console.log('=== RESPOSTA DA API ===');
    console.log('Resposta completa da API:', data);
    
    if (!data.jsonContent) {
      console.error('Resposta sem JSON:', data);
      throw new Error('A resposta não contém dados estruturados');
    }
    
    progressCallback(70);
    
    console.log('analyzeImageWithAI: Processando resposta da IA');
    console.log('JSON bruto recebido:', data.jsonContent);
    
    let aiResponse: AIAnalysisResponse;
    try {
      aiResponse = JSON.parse(data.jsonContent);
      console.log('Resposta da AI parseada:', aiResponse);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('JSON que causou erro:', data.jsonContent);
      throw new Error('Erro ao processar a resposta da IA');
    }
    
    // Map the AI response to our application format
    const extractedData = mapAIResponseToExtractedData(aiResponse);
    console.log('Dados mapeados finais:', extractedData);

    progressCallback(100);
    console.log('=== ANÁLISE CONCLUÍDA COM SUCESSO ===');
    return extractedData;
    
  } catch (error) {
    console.error('=== ERRO NA ANÁLISE ===');
    console.error('Erro na análise da imagem com IA:', error);
    throw error;
  }
};

// Re-export types for convenience
export * from './types';
