
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// Helper function to format the filename based on the proposal data
const getProposalFilename = (data: Partial<ExtractedData>, extension: string): string => {
  const clientName = data.clientName || 'Cliente';
  const cnpj = data.cnpj || '';
  const dateStr = format(new Date(), 'dd-MM-yyyy', { locale: ptBR });
  
  // Convert to a filename-friendly format (no spaces, accents, or special characters)
  const safeClientName = clientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-');

  return `proposta-${safeClientName}-${cnpj}-${dateStr}.${extension}`;
};

// Function to ensure all fonts and images are loaded before capturing
const ensureAllAssetsLoaded = async (): Promise<void> => {
  // Wait for fonts to load
  await document.fonts.ready;
  
  // Create a promise for each image element that isn't loaded yet
  const imgPromises = Array.from(document.querySelectorAll('img'))
    .filter(img => !img.complete)
    .map(img => new Promise<void>(resolve => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Don't block on error, just continue
    }));
  
  // Wait for all images to load
  await Promise.all(imgPromises);
  
  // Small delay to ensure CSS animations/transitions complete
  await new Promise(resolve => setTimeout(resolve, 500));
};

/**
 * Generate a PNG image from the proposal using html2canvas
 */
export const generateProposalPng = async (
  element: HTMLElement,
  data: Partial<ExtractedData>
): Promise<void> => {
  try {
    // Ensure all fonts and images are loaded before capturing
    await ensureAllAssetsLoaded();
    
    // Improved html2canvas options for higher quality
    const canvas = await html2canvas(element, {
      scale: 4, // Higher scale for better quality
      useCORS: true, // Allow cross-origin images
      allowTaint: true, // Allow potentially tainted images
      logging: false, // Disable logging
      backgroundColor: '#ffffff', // Ensure white background
      imageTimeout: 15000, // Longer timeout for images
      onclone: (clonedDoc) => {
        // Any additional manipulations on cloned document if needed
        const clonedElement = clonedDoc.body.querySelector('div') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.overflow = 'visible';
          // Remove data-lov-id attributes that might cause issues
          clonedElement.querySelectorAll('[data-lov-id]').forEach(el => {
            el.removeAttribute('data-lov-id');
          });
        }
      }
    });
    
    // Get the data URL and trigger download
    const imageData = canvas.toDataURL('image/png', 1.0);
    const filename = getProposalFilename(data, 'png');
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('PNG generated successfully');
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
};

/**
 * Generate a PDF from the proposal using jsPDF and html2canvas
 */
export const generateProposalPdf = async (
  element: HTMLElement,
  data: Partial<ExtractedData>
): Promise<void> => {
  try {
    // Ensure all fonts and images are loaded before capturing
    await ensureAllAssetsLoaded();
    
    // Create PDF with appropriate dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Get width and height in mm (assuming 96 DPI)
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Scale factor to fit the width of the PDF
    const scaleFactor = pageWidth / elementWidth;
    
    // Render the element to canvas with improved settings
    const canvas = await html2canvas(element, {
      scale: 3, // Higher scale for PDF quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.body.querySelector('div') as HTMLElement;
        if (clonedElement) {
          clonedElement.style.overflow = 'visible';
          
          // Remove data-lov-id attributes that might cause issues
          clonedElement.querySelectorAll('[data-lov-id]').forEach(el => {
            el.removeAttribute('data-lov-id');
          });
          
          // Apply additional styles to ensure content fits on one page
          const contentElements = clonedElement.querySelectorAll('.card-content, section');
          contentElements.forEach(el => {
            (el as HTMLElement).style.transform = 'scale(0.9)';
            (el as HTMLElement).style.transformOrigin = 'top left';
            (el as HTMLElement).style.margin = '0';
            (el as HTMLElement).style.padding = '10px';
          });
          
          // Reduce spacing between sections
          const sections = clonedElement.querySelectorAll('section');
          sections.forEach(section => {
            (section as HTMLElement).style.marginBottom = '5px';
          });
        }
      }
    });
    
    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate the scaled height (but ensure it fits on one page if possible)
    const imgHeight = Math.min(elementHeight * scaleFactor * 0.85, pdf.internal.pageSize.getHeight());
    
    // Add the image to the PDF (fitting to page width)
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
    
    // Save the PDF with a formatted filename
    const filename = getProposalFilename(data, 'pdf');
    pdf.save(filename);
    
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate a high-quality PDF or PNG using Browserless.io and Puppeteer
 * This uses a Supabase Edge Function to handle the rendering
 */
export const generateHighQualityFile = async (
  element: HTMLElement,
  data: Partial<ExtractedData>,
  format: 'pdf' | 'png' = 'png'
): Promise<void> => {
  // Use a unique ID to track this specific toast
  const toastId = `high-quality-${format}-${Date.now()}`;
  
  try {
    // Show initial loading toast
    toast.loading('Preparando seu documento para renderização...', {
      id: toastId
    });
    
    // Get the HTML content of the element
    const elementHTML = element.outerHTML;
    
    // Clean up HTML by removing data-lov-id attributes
    const cleanHTML = elementHTML.replace(/data-lov-id="[^"]*"/g, '');
    
    // Get the styles from the document
    const styles = Array.from(document.styleSheets)
      .filter(sheet => {
        try {
          // Only include same-origin stylesheets (avoid CORS issues)
          return sheet.href === null || sheet.href.startsWith(window.location.origin);
        } catch (e) {
          console.warn('Error accessing stylesheet', e);
          return false;
        }
      })
      .map(sheet => {
        try {
          // Get the rules from each stylesheet
          return Array.from(sheet.cssRules || [])
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          console.warn('Error accessing cssRules', e);
          return '';
        }
      })
      .join('\n');
    
    // Create a full HTML document with inline styles optimized for printing
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Proposta</title>
          <style>
            ${styles}
            @page {
              size: A4;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              font-family: 'Roboto', sans-serif;
              background-color: white;
            }
            .print-container {
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
              padding: 5mm;
              box-sizing: border-box;
              background-color: white;
              box-shadow: none;
              overflow: hidden;
            }
            /* Ensure all content fits in one page */
            .card-content {
              transform-origin: top left;
              transform: scale(0.90);
            }
            section {
              margin-bottom: 5px !important;
              padding: 5px !important;
            }
            /* Optimize spacing */
            .space-y-4, .space-y-6, .space-y-8 {
              margin-top: 5px !important;
              margin-bottom: 5px !important;
            }
            p {
              margin-top: 2px !important;
              margin-bottom: 2px !important;
            }
            @media print {
              body { background-color: white; }
              .print-container { box-shadow: none; }
              .pt-4, .pt-6, .pt-8 { padding-top: 2px !important; }
              .pb-4, .pb-6, .pb-8 { padding-bottom: 2px !important; }
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="print-container">
            ${cleanHTML}
          </div>
        </body>
      </html>
    `;
    
    console.log('Preparing to call render-proposal function...');
    // Use Sonner compatible method
    toast.loading('Conectando ao serviço de renderização...', { id: toastId });
    
    // Generate a filename
    const filename = `proposta-${data.clientName || 'Cliente'}-${data.cnpj || ''}`;
    
    // Add some retry logic for better resilience
    let retryCount = 0;
    const maxRetries = 2;
    let success = false;
    let lastError = null;
    
    while (retryCount <= maxRetries && !success) {
      try {
        toast.loading(`Tentativa ${retryCount + 1} de ${maxRetries + 1}: Renderizando ${format.toUpperCase()}...`, { id: toastId });
        
        // Call the Edge Function with specific content type and format
        const { data: responseData, error } = await supabase.functions.invoke('render-proposal', {
          body: {
            html: fullHtml,
            format: format,
            filename: filename
          }
        });
        
        if (error) {
          console.error('Error calling render function:', error);
          lastError = error;
          throw new Error(`Erro na comunicação: ${error.message || 'Erro desconhecido'}`);
        }
        
        // Improved error checking and handling
        if (!responseData) {
          console.error('No response data received from the render function');
          throw new Error('Não foi possível obter dados do serviço de renderização');
        }
        
        if (responseData.error) {
          console.error('Error returned by render function:', responseData.error);
          throw new Error(`Erro na renderização: ${responseData.error}`);
        }
        
        // Check if we got proper response data
        if (!responseData.data) {
          const errorMsg = responseData.error || 'Nenhum dado retornado do serviço de renderização';
          console.error('No data returned from render function:', responseData);
          throw new Error(errorMsg);
        }
        
        // Show processing message
        toast.loading(`Processando arquivo ${format.toUpperCase()} para download...`, { id: toastId });
        
        // Convert base64 to Blob with appropriate content type
        const byteCharacters = atob(responseData.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Set proper content type
        const contentType = format === 'pdf' ? 'application/pdf' : 'image/png';
        const blob = new Blob([byteArray], { type: contentType });
        
        // Create object URL and trigger download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        // Success message
        toast.success(`${format.toUpperCase()} de alta qualidade gerado com sucesso!`, { id: toastId });
        
        console.log(`High quality ${format} generated successfully`);
        success = true;
        break;
      } catch (error) {
        console.error(`Error on attempt ${retryCount + 1}:`, error);
        lastError = error;
        
        if (retryCount < maxRetries) {
          // Show retry message
          toast.loading(`Falha na tentativa ${retryCount + 1}. Tentando novamente em ${(retryCount + 1) * 2} segundos...`, { id: toastId });
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
          retryCount++;
        } else {
          throw error; // Throw the last error to be caught outside the loop
        }
      }
    }
    
    if (!success) {
      throw new Error(lastError?.message || 'Falha após múltiplas tentativas');
    }
  } catch (error) {
    console.error(`Error generating high quality ${format}:`, error);
    
    // Determine a more specific error message if possible
    let errorMessage = `Falha ao gerar ${format.toUpperCase()}`;
    
    if (error instanceof Error) {
      // Check for specific error patterns
      if (error.message.includes('png screenshots do not support')) {
        errorMessage = `Erro de configuração na geração de ${format.toUpperCase()}: Parâmetro inválido`;
      } else if (error.message.includes('timeout')) {
        errorMessage = `Tempo esgotado na geração do ${format.toUpperCase()}. Tente novamente com uma proposta menos complexa.`;
      } else if (error.message.includes('non-2xx status code')) {
        errorMessage = `O servidor de renderização retornou um erro ao gerar ${format.toUpperCase()}. Tente novamente mais tarde.`;
      } else if (error.message.includes('No response data')) {
        errorMessage = `Não foi possível obter uma resposta do serviço de renderização para ${format.toUpperCase()}.`;
      } else if (error.message.includes('Failed to parse')) {
        errorMessage = `Erro ao processar a resposta do serviço de renderização. Tente novamente.`;
      } else {
        errorMessage += `: ${error.message}`;
      }
    }
    
    // Show error toast with the specific message
    toast.error(errorMessage, { id: toastId });
    throw error;
  }
};
