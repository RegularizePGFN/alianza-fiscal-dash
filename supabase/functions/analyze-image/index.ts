
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
    const payload = await req.json();
    
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
      return new Response(
        JSON.stringify({ error: 'Falha ao processar a imagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Extrai o conteúdo JSON da resposta da IA
    const responseText = data.choices[0].message.content;
    let jsonContent;
    
    try {
      // Extrai apenas o objeto JSON da resposta da IA (que pode conter texto adicional)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      jsonContent = jsonMatch ? jsonMatch[0] : responseText;
    } catch (error) {
      console.error('Erro ao extrair JSON da resposta:', error);
      jsonContent = responseText; // Fallback para texto original
    }

    return new Response(
      JSON.stringify({ jsonContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao processar análise de imagem:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
