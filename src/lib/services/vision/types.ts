
/**
 * Type definitions for the vision service
 */
import { ExtractedData } from '@/lib/types/proposals';

/**
 * Response from the AI vision analysis
 */
export interface AIAnalysisResponse {
  cnpj: string;
  numero_processo: string;
  valor_total_sem_reducao: string;
  valor_total_com_reducao: string;
  percentual_de_reducao: string;
  valor_da_entrada_total: string;
  entrada_parcelada: {
    quantidade_parcelas: number;
    valor_parcela: string;
  };
  parcelamento_principal: {
    quantidade_parcelas: number;
    valor_parcela: string;
  };
}

/**
 * Response from the Edge function
 */
export interface EdgeFunctionResponse {
  jsonContent: string;
  error?: string;
  details?: string;
  rawResponse?: string;
}

/**
 * Payload for the OpenAI API
 */
export interface OpenAIPayload {
  model: string;
  messages: {
    role: string;
    content: Array<{
      type: string;
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }[];
  max_tokens: number;
}
