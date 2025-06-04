
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
    console.log('🚀 [ANALYZE-IMAGE-AI] Iniciando análise...');
    progressCallback(10);
    
    updateStatus('Enviando imagem para análise com IA...');
    progressCallback(30);
    
    // Send the image to the API
    console.log('📤 [ANALYZE-IMAGE-AI] Enviando para API...');
    const data = await sendImageToAnalysis(imageBase64);
    
    if (!data.jsonContent) {
      console.error('❌ [ANALYZE-IMAGE-AI] Resposta sem JSON:', data);
      const error = new Error('A resposta não contém dados estruturados') as any;
      error.code = 'NO_STRUCTURED_DATA';
      throw error;
    }
    
    progressCallback(70);
    updateStatus('Processando dados extraídos...');
    
    let aiResponse: AIAnalysisResponse;
    try {
      aiResponse = JSON.parse(data.jsonContent);
      console.log('✅ [ANALYZE-IMAGE-AI] Resposta da AI parseada:', aiResponse);
    } catch (parseError) {
      console.error('❌ [ANALYZE-IMAGE-AI] Erro ao fazer parse da resposta:', parseError);
      const error = new Error('Dados extraídos em formato inválido') as any;
      error.code = 'INVALID_EXTRACTED_DATA';
      throw error;
    }
    
    // Map the AI response to our application format
    console.log('🔄 [ANALYZE-IMAGE-AI] Mapeando dados...');
    const extractedData = mapAIResponseToExtractedData(aiResponse);
    
    progressCallback(100);
    updateStatus('Análise concluída com sucesso!');
    
    console.log('🎉 [ANALYZE-IMAGE-AI] Dados extraídos com sucesso:', extractedData);
    return extractedData;
    
  } catch (error: any) {
    console.error('💥 [ANALYZE-IMAGE-AI] Erro na análise:', error);
    
    // Se já tem código, propagar
    if (error.code) {
      throw error;
    }
    
    // Adicionar código genérico se não tiver
    error.code = 'ANALYSIS_ERROR';
    throw error;
  }
};

// Re-export types for convenience
export * from './types';
