
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ProposalData = {
  cnpj?: string;
  razaoSocial?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  totalDebt?: string;
  discountedValue?: string;
  discountPercentage?: string;
  entryValue?: string;
  entryInstallments?: string;
  installments?: string;
  installmentValue?: string;
  feesValue?: string;
  debtNumber?: string;
  businessActivity?: string;
  creationDate?: string;
  validityDate?: string;
  additionalComments?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
};

type RenderRequest = {
  data: ProposalData;
  especialista?: string;
  cores?: {
    primaria: string;
    secundaria: string;
    fundo: string;
  };
  preferencias?: {
    mostrarLogo: boolean;
    mostrarRodape: boolean;
    mostrarQRCode?: boolean;
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the OpenAI API key from environment variables
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Parse the request body
    const requestData: RenderRequest = await req.json();
    const { data, cores = {}, preferencias = {} } = requestData;

    // Calculate the economy value if totalDebt and discountedValue are provided
    let economyValue = '0,00';
    if (data.totalDebt && data.discountedValue) {
      try {
        const totalDebtValue = parseFloat(data.totalDebt.replace(/\D/g, '').replace(',', '.')) / 100;
        const discountedValue = parseFloat(data.discountedValue.replace(/\D/g, '').replace(',', '.')) / 100;
        const economy = totalDebtValue - discountedValue;
        economyValue = economy.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } catch (e) {
        console.error("Error calculating economy value:", e);
      }
    }

    // Format data for readability in prompt
    const formatProposalData = () => {
      let promptText = '';
      
      // Add razão social or client name
      if (data.razaoSocial) {
        promptText += `- Razão Social: ${data.razaoSocial}\n`;
      } else if (data.clientName) {
        promptText += `- Cliente: ${data.clientName}\n`;
      }
      
      // Add CNPJ if available
      if (data.cnpj) {
        promptText += `- CNPJ: ${data.cnpj}\n`;
      }
      
      // Add contact info if available
      if (data.clientPhone) {
        promptText += `- Telefone: ${data.clientPhone}\n`;
      }
      
      if (data.clientEmail) {
        promptText += `- Email: ${data.clientEmail}\n`;
      }
      
      // Add financial data
      if (data.totalDebt) {
        promptText += `- Valor Total da Dívida: ${data.totalDebt}\n`;
      }
      
      if (data.discountedValue) {
        promptText += `- Valor com Reduções: ${data.discountedValue}\n`;
      }
      
      if (data.discountPercentage) {
        promptText += `- Percentual de Desconto: ${data.discountPercentage}%\n`;
      }
      
      if (data.entryValue && data.entryInstallments) {
        promptText += `- Entrada: ${data.entryInstallments}x de ${data.entryValue}\n`;
      } else if (data.entryValue) {
        promptText += `- Entrada: ${data.entryValue}\n`;
      }
      
      if (data.installments && data.installmentValue) {
        promptText += `- Parcelado: ${data.installments}x de ${data.installmentValue}\n`;
      }
      
      if (data.feesValue) {
        promptText += `- Honorários: ${data.feesValue}\n`;
      }

      if (data.debtNumber) {
        promptText += `- Número do Processo: ${data.debtNumber}\n`;
      }
      
      if (data.businessActivity) {
        promptText += `- Atividade: ${data.businessActivity}\n`;
      }
      
      if (data.creationDate) {
        promptText += `- Data da Proposta: ${data.creationDate}\n`;
      }
      
      if (data.validityDate) {
        promptText += `- Válida até: ${data.validityDate}\n`;
      }
      
      return promptText;
    };

    // Construct the prompt for GPT-4o
    const prompt = `Gere uma imagem visual de uma proposta comercial de parcelamento da PGFN com base nos seguintes dados:

- Título: Proposta de Parcelamento PGFN
${formatProposalData()}
- Economia calculada: R$ ${economyValue}

Estilo visual desejado:
- Cores principais: ${cores.primaria || '#3B82F6'} (primária), ${cores.secundaria || '#1E40AF'} (secundária), fundo ${cores.fundo || '#F8FAFC'}
- Cabeçalho com logo e título "Proposta de Parcelamento PGFN"
- Faixa destacada no topo com texto: "Economia de R$ ${economyValue}"
- Seções organizadas com informações do cliente, valores, condições de pagamento
- Destaque para os honorários advocatícios
- Layout vertical limpo e profissional
${preferencias.mostrarRodape ? `- Rodapé com: Especialista Tributário: ${requestData.especialista || data.sellerName || 'Especialista PGFN'}` : ''}

Requisitos de design:
- Use um design moderno, com ícones minimalistas
- Tipografia clean e leitura fácil
- Cores contrastantes para facilitar leitura
- Design profissional adequado para documentos financeiros
- Estilo corporativo e confiável

Formato final:
- PNG, 1024x1536 px (retrato), fundo branco ou gradiente suave, alta resolução.
- Sem marca d'água ou assinaturas da IA.
- Inclua espaço para assinatura no rodapé.`;

    console.log("Sending prompt to OpenAI:", prompt);

    // Call OpenAI API to generate the image
    const openAIResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use GPT-4o for high quality image generation
        prompt: prompt,
        n: 1,
        size: "1024x1024", // OpenAI supports specific sizes
        response_format: "url",
      }),
    });

    const openAIData = await openAIResponse.json();
    
    // Check if the response contains the expected data
    if (!openAIData.data || !openAIData.data[0] || !openAIData.data[0].url) {
      console.error("Unexpected OpenAI API response:", openAIData);
      throw new Error('Failed to generate image: Invalid response from OpenAI');
    }

    // Return the generated image URL
    return new Response(
      JSON.stringify({
        imageUrl: openAIData.data[0].url,
        prompt: prompt,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in render-proposal-image function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred while generating the proposal image',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
