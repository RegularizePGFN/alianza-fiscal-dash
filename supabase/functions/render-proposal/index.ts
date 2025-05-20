
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

// Define CORS headers
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
    // Parse request body
    const { proposalData, templateStyle } = await req.json();
    
    // Create prompt for AI image generation
    const systemPrompt = `You are a professional proposal document designer. 
Create a visually appealing, professional business proposal document based on the data provided.
Use a clean, modern design with the following styling:
- Primary color: ${templateStyle?.primaryColor || '#3B82F6'}
- Secondary color: ${templateStyle?.secondaryColor || '#1E40AF'}
- Accent color: ${templateStyle?.accentColor || '#10B981'}
- Background color: ${templateStyle?.backgroundColor || '#F8FAFC'}
- Font: Arial or Helvetica for clean professional look
- Layout: Single page, clear sections, proper spacing
- Include company logo placeholder at top
- Format currency values with Brazilian Real (R$) format
- Use appropriate visual hierarchy for different section titles
- Include subtle visual elements like dividing lines and small accent elements
- Add a section for signature at bottom if applicable`;

    // Format the client data nicely
    const clientInfo = proposalData.clientName ? 
      `Cliente: ${proposalData.clientName}
CNPJ: ${proposalData.cnpj || 'N/A'}
Email: ${proposalData.clientEmail || 'N/A'}
Telefone: ${proposalData.clientPhone || 'N/A'}` : 
      `CNPJ: ${proposalData.cnpj || 'N/A'}`;

    // Format the financial information
    const financialInfo = `Valor da Dívida: R$ ${proposalData.totalDebt || '0,00'}
Valor com Desconto: R$ ${proposalData.discountedValue || '0,00'}
Percentual de Desconto: ${proposalData.discountPercentage || '0'}%
Número do Processo: ${proposalData.debtNumber || 'N/A'}`;

    // Format the payment details
    const paymentDetails = `Valor de Entrada: R$ ${proposalData.entryValue || '0,00'}
Parcelas da Entrada: ${proposalData.entryInstallments || '1'}
Parcelas Restantes: ${proposalData.installments || '0'}
Valor da Parcela: R$ ${proposalData.installmentValue || '0,00'}`;

    // Format the fees information
    const feesInfo = `Honorários Advocatícios: R$ ${proposalData.feesValue || '0,00'}
(20% sobre a economia)`;

    // Format dates
    const datesInfo = `Data de Criação: ${proposalData.creationDate || 'N/A'}
Validade da Proposta: ${proposalData.validityDate || 'N/A'}`;

    // Format specialist info
    const specialistInfo = `Especialista: ${proposalData.specialistName || 'N/A'}`;

    // Create user prompt with all the necessary details
    const userPrompt = `Create a professional business proposal image that looks like a PDF document with the following information:

===== HEADER =====
PROPOSTA DE ACORDO TRIBUTÁRIO

===== CLIENT INFORMATION =====
${clientInfo}

===== FINANCIAL DETAILS =====
${financialInfo}

===== PAYMENT TERMS =====
${paymentDetails}

===== FEES =====
${feesInfo}

===== DATES =====
${datesInfo}

===== SPECIALIST =====
${specialistInfo}

===== INSTRUCTIONS =====
- Make it look like a professionally designed document in portrait format (PDF style)
- Use an elegant header with a logo placeholder
- Structure the information in clear sections with proper spacing
- Use subtle visual elements like dividing lines and small accent elements
- Add a signature line at the bottom
- Keep the text readable and well-organized
- Use Brazilian Portuguese language formatting for all text
- Make sure currency values are properly formatted with R$ symbol`;

    console.log("Sending request to OpenAI...");

    // Call OpenAI API to generate the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 4096
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Call DALL-E 3 to generate the proposal image
    console.log("Generating image with DALL-E...");
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a professional business proposal document image based on the following text. Make sure it looks like a real business document with the header "PROPOSTA DE ACORDO TRIBUTÁRIO" at the top:
        
${generatedText}

The document should look like a formal proposal or contract in portrait format. Include all the information provided, properly formatted as sections with clear headings. Make it extremely professional looking, as if it were generated by a law firm or tax consultancy.`,
        n: 1,
        size: "1024x1792",
        quality: "hd",
        style: "natural"
      }),
    });

    if (!dalleResponse.ok) {
      const errorData = await dalleResponse.json();
      console.error("DALL-E API error:", errorData);
      throw new Error(`DALL-E API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const imageData = await dalleResponse.json();
    const generatedImageUrl = imageData.data[0].url;

    // Download the image and convert to base64
    console.log("Downloading and converting image...");
    const imageResponse = await fetch(generatedImageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: generatedImageUrl,
        imageBase64: `data:image/png;base64,${base64Image}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in render-proposal function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
