
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API Key não configurada no servidor');
    }
    
    const payload = await req.json();
    
    console.log('Enviando requisição para OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na API da OpenAI:', errorData);
      
      // Detailed error messages based on OpenAI error types
      let errorMessage = 'Falha ao processar a imagem';
      
      if (errorData.error) {
        if (errorData.error.type === 'invalid_request_error') {
          errorMessage = 'Requisição inválida para a IA (verifique o formato da imagem)';
        } else if (errorData.error.type === 'authentication_error') {
          errorMessage = 'Erro de autenticação com a API da IA';
        } else if (errorData.error.code === 'content_policy_violation') {
          errorMessage = 'A imagem não parece ser uma proposta PGFN válida';
        } else if (errorData.error.message) {
          errorMessage = `Erro da OpenAI: ${errorData.error.message}`;
        }
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Verifica se temos uma resposta válida
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      throw new Error('Resposta da IA não contém os dados esperados');
    }
    
    // Extrai o conteúdo JSON da resposta da IA
    const responseText = data.choices[0].message.content;
    let jsonContent;
    
    try {
      // Extrai apenas o objeto JSON da resposta da IA (que pode conter texto adicional)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Não foi possível extrair JSON da resposta');
      }
      
      jsonContent = jsonMatch[0];
      
      // Verifica se o JSON é válido
      JSON.parse(jsonContent);
    } catch (error) {
      console.error('Erro ao extrair JSON da resposta:', error);
      return new Response(
        JSON.stringify({ error: 'A IA não conseguiu interpretar a imagem corretamente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Análise completa, retornando dados');
    
    return new Response(
      JSON.stringify({ jsonContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao processar análise de imagem:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro desconhecido na análise da imagem' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
