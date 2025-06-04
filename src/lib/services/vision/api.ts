
/**
 * API calls for the vision service
 */
import { MODEL, VISION_PROMPT, REQUEST_TIMEOUT, MAX_TOKENS } from './config';
import { getEdgeFunctionUrl } from './utils';
import { OpenAIPayload, EdgeFunctionResponse } from './types';

/**
 * Sends an image to the OpenAI API via Edge Function
 * 
 * @param imageBase64 - The image in base64 format
 * @returns The response from the API
 */
export const sendImageToAnalysis = async (
  imageBase64: string
): Promise<EdgeFunctionResponse> => {
  console.log('🚀 [VISION-API] Iniciando envio para análise...');
  
  const base64Image = imageBase64.split(',')[1];
    
  if (!base64Image) {
    console.error('❌ [VISION-API] Formato de imagem inválido');
    const error = new Error('Formato de imagem inválido') as any;
    error.code = 'INVALID_IMAGE_FORMAT';
    throw error;
  }
  
  // Prepara o payload para a API da OpenAI
  const payload: OpenAIPayload = {
    model: MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: VISION_PROMPT },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: MAX_TOKENS
  };

  // Tratamento de erros na requisição
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.error('⏰ [VISION-API] Timeout na requisição');
    controller.abort();
  }, REQUEST_TIMEOUT);
  
  console.log('📤 [VISION-API] Enviando para edge function...');
  
  // Obter a URL correta para a função edge
  const functionUrl = getEdgeFunctionUrl();
  console.log(`🔗 [VISION-API] URL: ${functionUrl}`);
  
  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📨 [VISION-API] Resposta recebida - Status: ${response.status}`);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ [VISION-API] Erro da edge function:', errorData);
      } catch (e) {
        console.error('❌ [VISION-API] Erro ao ler resposta de erro:', e);
        const errorText = await response.text() || `Erro HTTP ${response.status}`;
        const error = new Error(errorText) as any;
        error.code = 'HTTP_ERROR';
        throw error;
      }
      
      // Propagar o erro com código se disponível
      const error = new Error(errorData.error || 'Erro na análise da imagem') as any;
      error.code = errorData.code || 'EDGE_FUNCTION_ERROR';
      throw error;
    }
    
    // Usar o método json() diretamente
    const result = await response.json();
    console.log('✅ [VISION-API] Resposta processada com sucesso');
    return result;
    
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    console.error('💥 [VISION-API] Erro na requisição:', fetchError);
    
    if (fetchError.name === 'AbortError') {
      const error = new Error('A análise da imagem demorou muito tempo e foi cancelada') as any;
      error.code = 'TIMEOUT';
      throw error;
    }
    
    // Se já é um erro com código, propagar
    if (fetchError.code) {
      throw fetchError;
    }
    
    // Outros erros de rede
    const error = new Error('Erro de conexão com o servidor') as any;
    error.code = 'CONNECTION_ERROR';
    throw error;
  }
};
