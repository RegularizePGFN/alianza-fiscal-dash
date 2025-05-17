
/**
 * Serviço de análise de imagens utilizando o modelo GPT-4-turbo da OpenAI
 */
import { ExtractedData } from '@/lib/types/proposals';

const MODEL = 'gpt-4o'; // Atualizando para gpt-4o que tem capacidade de visão

/**
 * Prompt para enviar junto com a imagem para o modelo da OpenAI
 */
const VISION_PROMPT = `
Esta é uma imagem de uma proposta de parcelamento da PGFN (Procuradoria-Geral da Fazenda Nacional). Extraia os seguintes dados da proposta, levando em consideração que a entrada também pode estar parcelada:

- CNPJ da empresa
- Número do processo
- Valor total da dívida sem redução
- Valor total com redução
- Percentual efetivo de redução
- Valor total da entrada (com ou sem parcelamento)
- Quantidade de parcelas da entrada e valor de cada parcela (se a entrada for parcelada)
- Quantidade de parcelas do parcelamento principal e valor de cada parcela

A resposta deve estar em JSON, com os campos claramente identificados, exatamente no seguinte formato:

{
  "cnpj": "",
  "numero_processo": "",
  "valor_total_sem_reducao": "",
  "valor_total_com_reducao": "",
  "percentual_de_reducao": "",
  "valor_da_entrada_total": "",
  "entrada_parcelada": {
    "quantidade_parcelas": ,
    "valor_parcela": ""
  },
  "parcelamento_principal": {
    "quantidade_parcelas": ,
    "valor_parcela": ""
  }
}

Garanta que os valores monetários mantenham o símbolo "R$" e duas casas decimais. Caso alguma informação não esteja visível na imagem, retorne esse campo como null.
`;

interface AIAnalysisResponse {
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
 * Analisa uma imagem usando o modelo de visão da OpenAI
 * 
 * @param imageBase64 - Imagem em formato base64
 * @param progressCallback - Callback para atualizar o progresso
 * @returns Dados extraídos da imagem
 */
export const analyzeImageWithAI = async (
  imageBase64: string, 
  progressCallback: (progress: number) => void
): Promise<Partial<ExtractedData>> => {
  try {
    progressCallback(10);
    const base64Image = imageBase64.split(',')[1];
    
    if (!base64Image) {
      throw new Error('Formato de imagem inválido');
    }
    
    // Prepara o payload para a API da OpenAI
    const payload = {
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
      max_tokens: 1500
    };

    progressCallback(30);
    
    // Melhor tratamento de erros na requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout
    
    console.log('Enviando imagem para análise...');
    
    try {
      // Importante: Chama diretamente a função Supabase em vez de usar /api/
      const response = await fetch('/functions/analyze-image', {
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
      
      // Importante: Usar o método json() diretamente, sem clone para evitar erros de stream
      const data = await response.json();
      
      if (!data.jsonContent) {
        console.error('Resposta sem JSON:', data);
        throw new Error('A resposta não contém dados estruturados');
      }
      
      progressCallback(70);
      
      const aiResponse: AIAnalysisResponse = JSON.parse(data.jsonContent);
      console.log('Resposta da AI processada com sucesso:', aiResponse);
      
      // Mapeia o resultado da IA para o formato esperado pelo aplicativo
      const extractedData: Partial<ExtractedData> = {
        cnpj: aiResponse.cnpj || '',
        debtNumber: aiResponse.numero_processo || '',
        totalDebt: aiResponse.valor_total_sem_reducao?.replace('R$', '').trim() || '0,00',
        discountedValue: aiResponse.valor_total_com_reducao?.replace('R$', '').trim() || '0,00',
        discountPercentage: aiResponse.percentual_de_reducao?.replace('%', '').trim() || '0',
        entryValue: aiResponse.valor_da_entrada_total?.replace('R$', '').trim() || '0,00',
        entryInstallments: String(aiResponse.entrada_parcelada?.quantidade_parcelas || 1),
        installments: String(aiResponse.parcelamento_principal?.quantidade_parcelas || 0),
        installmentValue: aiResponse.parcelamento_principal?.valor_parcela?.replace('R$', '').trim() || '0,00',
        feesValue: '0,00' // Não existe no modelo da IA, deixamos valor padrão
      };

      progressCallback(100);
      return extractedData;
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Erro na requisição para a API:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('A análise da imagem demorou muito tempo e foi cancelada');
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('Erro na análise da imagem com IA:', error);
    throw error;
  }
};
