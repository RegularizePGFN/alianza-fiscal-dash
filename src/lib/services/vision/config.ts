
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

/**
 * Maximum number of tokens to request from the API
 */
export const MAX_TOKENS = 1500;

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 60000;
