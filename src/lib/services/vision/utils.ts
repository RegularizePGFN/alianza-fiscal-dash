
/**
 * Utility functions for the vision service
 */
import { AIAnalysisResponse, EdgeFunctionResponse } from './types';
import { ExtractedData } from '@/lib/types/proposals';

/**
 * Detecta se o ambiente é local ou produção para usar a URL correta
 * @returns URL da função edge
 */
export const getEdgeFunctionUrl = (): string => {
  // Se estivermos em localhost (desenvolvimento local)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:54321/functions/v1/analyze-image';
  }
  
  // Se estivermos em produção (Supabase Cloud)
  return 'https://sbxltdbnqixucjoognfj.functions.supabase.co/analyze-image';
};

/**
 * Mapeia os resultados da AI para o formato usado pela aplicação
 */
export const mapAIResponseToExtractedData = (aiResponse: AIAnalysisResponse): Partial<ExtractedData> => {
  // Extract the values from AI response
  const totalDebt = aiResponse.valor_total_sem_reducao?.replace('R$', '').trim() || '0,00';
  const discountedValue = aiResponse.valor_total_com_reducao?.replace('R$', '').trim() || '0,00';
  
  // Calculate fees as 20% of the savings
  let feesValue = '0,00';
  try {
    const totalDebtNum = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
    const discountedValueNum = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
    
    if (!isNaN(totalDebtNum) && !isNaN(discountedValueNum)) {
      const savings = totalDebtNum - discountedValueNum;
      const fees = savings * 0.2; // 20% of the savings
      
      // Format with Brazilian number format
      feesValue = fees.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  } catch (error) {
    console.error("Error calculating fees:", error);
  }
  
  return {
    cnpj: aiResponse.cnpj || '',
    debtNumber: aiResponse.numero_processo || '',
    totalDebt: totalDebt,
    discountedValue: discountedValue,
    discountPercentage: aiResponse.percentual_de_reducao?.replace('%', '').trim() || '0',
    entryValue: aiResponse.valor_da_entrada_total?.replace('R$', '').trim() || '0,00',
    entryInstallments: String(aiResponse.entrada_parcelada?.quantidade_parcelas || 1),
    installments: String(aiResponse.parcelamento_principal?.quantidade_parcelas || 0),
    installmentValue: aiResponse.parcelamento_principal?.valor_parcela?.replace('R$', '').trim() || '0,00',
    feesValue: feesValue
  };
};
