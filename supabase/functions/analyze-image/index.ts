
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
    
    // Verificar se há alguma imagem no payload
    const hasImage = payload.messages?.some(msg => 
      msg.content?.some?.(item => item.type === 'image_url')
    );
    
    if (!hasImage) {
      throw new Error('Nenhuma imagem encontrada no payload');
    }
    
    // Adicionar timeout para a requisição
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 segundos timeout
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        let errorText = '';
        
        try {
          errorData = await response.json();
          console.error('Erro na API da OpenAI:', errorData);
          
          if (errorData.error?.message) {
            errorText = errorData.error.message;
          } else {
            errorText = `Erro do servidor OpenAI: ${response.status}`;
          }
        } catch (e) {
          errorText = await response.text() || `Erro do servidor OpenAI: ${response.status}`;
          console.error('Resposta de erro não-JSON da OpenAI:', errorText);
        }
        
        return new Response(
          JSON.stringify({ error: errorText }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verificar se conseguimos ler o corpo da resposta
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('A resposta da OpenAI está vazia');
      }
      
      const data = JSON.parse(responseText);
      
      // Verifica se temos uma resposta válida
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
        throw new Error('Resposta da IA não contém os dados esperados');
      }
      
      // Extrai o conteúdo JSON da resposta da IA
      const contentText = data.choices[0].message.content;
      let jsonContent;
      
      console.log('Texto da resposta:', contentText.substring(0, 100) + '...');
      
      try {
        // Extrai apenas o objeto JSON da resposta da IA (que pode conter texto adicional)
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Não foi possível extrair JSON da resposta');
        }
        
        jsonContent = jsonMatch[0];
        
        // Verifica se o JSON é válido
        JSON.parse(jsonContent);
        console.log('JSON extraído com sucesso');
      } catch (error) {
        console.error('Erro ao extrair JSON da resposta:', error);
        return new Response(
          JSON.stringify({ 
            error: 'A IA não conseguiu interpretar a imagem corretamente',
            rawResponse: contentText.substring(0, 500) // Retorna parte da resposta bruta para diagnóstico
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Análise completa, retornando dados');
      
      return new Response(
        JSON.stringify({ jsonContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Erro na chamada para OpenAI:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: 'Timeout na conexão com a OpenAI' }),
          { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Erro ao processar análise de imagem:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro desconhecido na análise da imagem',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
