/**
 * Configuration for the vision service
 */

/**
 * OpenAI model to use for vision tasks
 */
export const MODEL = 'gpt-4o'; 

/**
 * Prompt template to send to the vision model
 */
export const VISION_PROMPT = `
Esta é uma imagem de uma negociação de dívidas da Receita Federal, PGFN ou sistemas relacionados (como SISPAR, Simples Nacional). 

Analise cuidadosamente a imagem e extraia as seguintes informações, independentemente do layout ou formato apresentado:

DADOS A EXTRAIR:
- CNPJ da empresa (pode aparecer como "CNPJ:" ou em formato XX.XXX.XXX/XXXX-XX)
- Número do processo (se disponível)
- Valor total sem desconto/redução (pode aparecer como "Total sem desconto", "Valor consolidado", etc.)
- Valor total com desconto/redução (pode aparecer como "Total a pagar", "Valor com reduções", etc.)
- Valor do desconto ou percentual de redução (calcule se necessário)
- Informações sobre entrada e parcelamento

FORMAS DE PAGAMENTO:
- Se houver opção "Entrada" ou similar, extraia o valor e quantidade de parcelas
- Se houver opção "Básica", "Parcelado" ou similar, extraia o valor e quantidade de parcelas
- Observe que pode haver diferentes modalidades de pagamento

CÁLCULO CORRETO DO PERCENTUAL DE DESCONTO:
SEMPRE calcule o percentual usando esta fórmula EXATA:
Percentual = ((Valor_sem_desconto - Valor_com_desconto) / Valor_sem_desconto) * 100

Exemplo: Se valor sem desconto = R$ 11.773,09 e valor com desconto = R$ 6.594,56
Cálculo: ((11773.09 - 6594.56) / 11773.09) * 100 = 43,98%
Formato final: "44%" (arredondar para número inteiro mais próximo)

IMPORTANTE: NUNCA use percentuais que aparecem na imagem se eles estiverem incorretos. SEMPRE recalcule!

A resposta deve estar em JSON, exatamente no seguinte formato:

{
  "cnpj": "",
  "numero_processo": "",
  "valor_total_sem_reducao": "",
  "valor_total_com_reducao": "",
  "percentual_de_reducao": "",
  "valor_da_entrada_total": "",
  "entrada_parcelada": {
    "quantidade_parcelas": null,
    "valor_parcela": ""
  },
  "parcelamento_principal": {
    "quantidade_parcelas": null,
    "valor_parcela": ""
  }
}

INSTRUÇÕES IMPORTANTES:
- Mantenha valores monetários com "R$" e duas casas decimais
- Use números inteiros para quantidade de parcelas (sem aspas)
- Para o percentual, use formato "XX%" (número inteiro + símbolo %)
- Se alguma informação não estiver visível, use null
- Se houver múltiplas opções de negociação, extraia a primeira ou mais relevante
- Seja flexível com os termos: "desconto", "redução", "economia" podem ser sinônimos
- "Entrada" e "À vista" podem se referir ao mesmo tipo de pagamento
- SEMPRE recalcule o percentual de desconto, mesmo que apareça na imagem
`;

/**
 * Maximum number of tokens to request from the API
 */
export const MAX_TOKENS = 1500;

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 60000;