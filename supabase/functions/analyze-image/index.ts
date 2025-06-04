
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
    console.log('🚀 [ANALYZE-IMAGE] Iniciando análise de imagem...');
    
    if (!openAIApiKey) {
      console.error('❌ [ANALYZE-IMAGE] OpenAI API Key não encontrada');
      return new Response(
        JSON.stringify({ 
          error: 'Configuração da API da OpenAI não encontrada no servidor',
          code: 'API_KEY_MISSING'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let payload;
    try {
      payload = await req.json();
      console.log('📝 [ANALYZE-IMAGE] Payload recebido com sucesso');
    } catch (e) {
      console.error('❌ [ANALYZE-IMAGE] Erro ao fazer parse do JSON:', e);
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos enviados para análise',
          code: 'INVALID_JSON'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verificar se há alguma imagem no payload
    const hasImage = payload.messages?.some(msg => 
      msg.content?.some?.(item => item.type === 'image_url')
    );
    
    if (!hasImage) {
      console.error('❌ [ANALYZE-IMAGE] Nenhuma imagem encontrada no payload');
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma imagem foi enviada para análise',
          code: 'NO_IMAGE'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('📤 [ANALYZE-IMAGE] Enviando requisição para OpenAI...');
    
    // Adicionar timeout para a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('⏰ [ANALYZE-IMAGE] Timeout na requisição para OpenAI');
      controller.abort();
    }, 60000); // 60 segundos timeout
    
    let response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log(`📨 [ANALYZE-IMAGE] Resposta da OpenAI recebida - Status: ${response.status}`);
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('💥 [ANALYZE-IMAGE] Erro na chamada para OpenAI:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            error: 'A análise da imagem demorou muito tempo. Tente novamente com uma imagem menor.',
            code: 'TIMEOUT'
          }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Erro na conexão com o serviço de IA. Tente novamente.',
          code: 'CONNECTION_ERROR',
          details: fetchError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      let errorData;
      let errorText = '';
      
      try {
        errorData = await response.json();
        console.error('❌ [ANALYZE-IMAGE] Erro na API da OpenAI:', errorData);
        
        if (errorData.error?.message) {
          errorText = errorData.error.message;
        } else {
          errorText = `Erro do servidor OpenAI: ${response.status}`;
        }
      } catch (e) {
        errorText = await response.text() || `Erro do servidor OpenAI: ${response.status}`;
        console.error('❌ [ANALYZE-IMAGE] Resposta de erro não-JSON da OpenAI:', errorText);
      }
      
      // Criar mensagens de erro mais detalhadas
      let errorMessage = 'Falha ao processar a imagem com IA';
      let errorCode = 'OPENAI_ERROR';
      
      if (errorData?.error) {
        if (errorData.error.type === 'invalid_request_error') {
          errorMessage = 'Requisição inválida. Verifique o formato da imagem.';
          errorCode = 'INVALID_REQUEST';
        } else if (errorData.error.type === 'authentication_error') {
          errorMessage = 'Erro de autenticação com a API da IA';
          errorCode = 'AUTH_ERROR';
        } else if (errorData.error.code === 'content_policy_violation') {
          errorMessage = 'A imagem não parece ser uma proposta PGFN válida';
          errorCode = 'INVALID_CONTENT';
        } else if (errorText) {
          errorMessage = `Erro da OpenAI: ${errorText}`;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          code: errorCode,
          details: errorText 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se conseguimos ler o corpo da resposta
    let responseText;
    try {
      responseText = await response.text();
      console.log('📄 [ANALYZE-IMAGE] Texto da resposta obtido com sucesso');
    } catch (e) {
      console.error('❌ [ANALYZE-IMAGE] Erro ao ler resposta:', e);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar resposta da IA',
          code: 'RESPONSE_READ_ERROR'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!responseText || responseText.trim() === '') {
      console.error('❌ [ANALYZE-IMAGE] Resposta da OpenAI está vazia');
      return new Response(
        JSON.stringify({ 
          error: 'A IA não retornou dados. Tente novamente.',
          code: 'EMPTY_RESPONSE'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ [ANALYZE-IMAGE] JSON da resposta parseado com sucesso');
    } catch (e) {
      console.error('❌ [ANALYZE-IMAGE] Erro ao fazer parse do JSON da resposta:', e);
      return new Response(
        JSON.stringify({ 
          error: 'Resposta da IA em formato inválido',
          code: 'INVALID_RESPONSE_JSON'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verifica se temos uma resposta válida
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      console.error('❌ [ANALYZE-IMAGE] Resposta da IA não contém os dados esperados');
      return new Response(
        JSON.stringify({ 
          error: 'Resposta da IA incompleta. Tente novamente.',
          code: 'INCOMPLETE_RESPONSE'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extrai o conteúdo JSON da resposta da IA
    const contentText = data.choices[0].message.content;
    let jsonContent;
    
    console.log('🔍 [ANALYZE-IMAGE] Extraindo JSON da resposta...');
    
    try {
      // Extrai apenas o objeto JSON da resposta da IA
      const jsonMatch = contentText.match(/\{[^]*\}/);
      if (!jsonMatch) {
        console.error('❌ [ANALYZE-IMAGE] Não foi possível extrair JSON da resposta');
        return new Response(
          JSON.stringify({ 
            error: 'A IA não conseguiu interpretar a imagem corretamente. Tente com uma imagem mais clara.',
            code: 'NO_JSON_EXTRACTED',
            rawResponse: contentText.substring(0, 500)
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      jsonContent = jsonMatch[0];
      
      // Verifica se o JSON é válido
      JSON.parse(jsonContent);
      console.log('✅ [ANALYZE-IMAGE] JSON extraído e validado com sucesso');
    } catch (error) {
      console.error('❌ [ANALYZE-IMAGE] Erro ao extrair/validar JSON:', error);
      return new Response(
        JSON.stringify({ 
          error: 'A IA não conseguiu interpretar a imagem corretamente. Tente com uma imagem mais clara ou de melhor qualidade.',
          code: 'INVALID_EXTRACTED_JSON',
          rawResponse: contentText.substring(0, 500)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎉 [ANALYZE-IMAGE] Análise completa com sucesso!');
    
    return new Response(
      JSON.stringify({ jsonContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
      
  } catch (error) {
    console.error('💥 [ANALYZE-IMAGE] Erro geral na análise:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor durante a análise da imagem',
        code: 'INTERNAL_ERROR',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
