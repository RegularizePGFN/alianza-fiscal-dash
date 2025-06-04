
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
  const base64Image = imageBase64.split(',')[1];
    
  if (!base64Image) {
    throw new Error('Formato de imagem inválido');
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
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  console.log('Enviando imagem para análise...');
  
  // Obter a URL correta para a função edge
  const functionUrl = getEdgeFunctionUrl();
  console.log(`Usando endpoint: ${functionUrl}`);
  
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
    
    // Verificar e logar detalhes da resposta
    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = errorData.error || 'Erro desconhecido no servidor';
        console.error('Detalhes do erro:', errorData);
      } catch (e) {
        errorText = await response.text() || `Erro do servidor: ${response.status}`;
        console.error('Resposta bruta de erro:', errorText);
      }
      
      throw new Error(`Erro na análise: ${errorText}`);
    }
    
    // Usar o método json() diretamente, sem clone para evitar erros de stream
    return await response.json();
    
  } catch (fetchError) {
    clearTimeout(timeoutId);
    console.error('Erro na requisição para a API:', fetchError);
    
    if (fetchError.name === 'AbortError') {
      throw new Error('A análise da imagem demorou muito tempo e foi cancelada');
    }
    
    throw fetchError;
  }
};
