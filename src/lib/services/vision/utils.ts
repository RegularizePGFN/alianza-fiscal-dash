
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
  console.log('=== MAPEANDO DADOS DA IA ===');
  console.log('Resposta bruta da IA:', aiResponse);
  
  // Função auxiliar para limpar valores monetários
  const cleanMonetaryValue = (value: string | undefined | null): string => {
    if (!value) return '0,00';
    return value.replace('R$', '').trim();
  };
  
  // Função auxiliar para limpar percentual
  const cleanPercentage = (value: string | undefined | null): string => {
    if (!value) return '0';
    return value.replace('%', '').trim();
  };
  
  // Extract the values from AI response with better error handling
  const totalDebt = cleanMonetaryValue(aiResponse.valor_total_sem_reducao);
  const discountedValue = cleanMonetaryValue(aiResponse.valor_total_com_reducao);
  const entryValue = cleanMonetaryValue(aiResponse.valor_da_entrada_total);
  const installmentValue = cleanMonetaryValue(aiResponse.parcelamento_principal?.valor_parcela);
  const discountPercentage = cleanPercentage(aiResponse.percentual_de_reducao);
  
  console.log('Valores extraídos:');
  console.log('- Total da dívida:', totalDebt);
  console.log('- Valor com desconto:', discountedValue);
  console.log('- Valor de entrada:', entryValue);
  console.log('- Valor da parcela:', installmentValue);
  console.log('- Percentual de desconto:', discountPercentage);
  
  // Calculate fees as 20% of the savings
  let feesValue = '0,00';
  try {
    const totalDebtNum = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
    const discountedValueNum = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
    
    if (!isNaN(totalDebtNum) && !isNaN(discountedValueNum) && totalDebtNum > 0 && discountedValueNum > 0) {
      const savings = totalDebtNum - discountedValueNum;
      const fees = savings * 0.2; // 20% of the savings
      
      // Format with Brazilian number format
      feesValue = fees.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      console.log('Honorários calculados:', feesValue);
    } else {
      console.log('Não foi possível calcular honorários - valores inválidos');
    }
  } catch (error) {
    console.error("Error calculating fees:", error);
  }
  
  const extractedData = {
    cnpj: aiResponse.cnpj || '',
    debtNumber: aiResponse.numero_processo || '',
    totalDebt: totalDebt,
    discountedValue: discountedValue,
    discountPercentage: discountPercentage,
    entryValue: entryValue,
    entryInstallments: String(aiResponse.entrada_parcelada?.quantidade_parcelas || 1),
    installments: String(aiResponse.parcelamento_principal?.quantidade_parcelas || 0),
    installmentValue: installmentValue,
    feesValue: feesValue
  };
  
  console.log('Dados finais mapeados:', extractedData);
  console.log('=== FIM DO MAPEAMENTO ===');
  
  return extractedData;
};
