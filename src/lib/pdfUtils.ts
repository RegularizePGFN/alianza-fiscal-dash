
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';

export async function generateProposalPng(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Wait for a complete render cycle
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Wait for all fonts to load for accurate rendering
    await document.fonts.ready;
    
    // Get seller name for filename
    const seller = data.sellerName ? 
      data.sellerName.replace(/[^\w]/g, '_').toLowerCase() : 'vendedor';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${seller}.png`;

    // Capture the content exactly as it appears on screen without modifications
    const canvas = await html2canvas(proposalElement, {
      scale: 2, // Bom balanço entre qualidade e tamanho do arquivo
      useCORS: true, // Enable CORS for any images
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff', // Fundo branco para consistência
      imageTimeout: 0, // No timeout for image loading
      // Não aplicamos transformações para manter exatamente como está na tela
    });
    
    // Create a download link for the PNG with maximum quality
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality (1.0)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PNG:', error);
    return Promise.reject(error);
  }
}

export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Get specialist name for filename
    const specialist = data.specialistName ? 
      data.specialistName.replace(/[^\w]/g, '_').toLowerCase() : 'especialista';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${specialist}.pdf`;

    // Clone the element to avoid modifying the original
    const clonedElement = proposalElement.cloneNode(true) as HTMLElement;
    
    // Create a temporary container for the PDF content with all necessary styles
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.padding = '0';
    tempContainer.style.margin = '0';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.fontSize = '9px'; // Reduzir ainda mais o tamanho da fonte para caber em uma página
    
    // Hide action buttons
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
      }
    });
    
    // Reduzir SIGNIFICATIVAMENTE espaçamento entre elementos para caber em uma página
    const sections = clonedElement.querySelectorAll('div.space-y-4, div.mb-6, div.mt-8, div.my-4');
    sections.forEach(section => {
      if (section instanceof HTMLElement) {
        section.style.marginTop = '4px';
        section.style.marginBottom = '4px';
        section.classList.remove('space-y-4', 'mb-6', 'mt-8', 'space-y-6');
        section.classList.add('space-y-1', 'mb-2', 'mt-1');
      }
    });
    
    // Comprimir elementos e grids para economizar espaço
    const grids = clonedElement.querySelectorAll('.grid');
    grids.forEach(grid => {
      if (grid instanceof HTMLElement) {
        grid.style.gap = '4px';
      }
    });
    
    // Reduzir tamanho do cabeçalho
    const headers = clonedElement.querySelectorAll('h1, h2, h3');
    headers.forEach(header => {
      if (header instanceof HTMLElement) {
        header.style.fontSize = '12px';
        header.style.marginBottom = '2px';
        header.style.marginTop = '2px';
      }
    });
    
    // Comprimir espaço em padding de cards
    const cards = clonedElement.querySelectorAll('.card, .border, [class*="p-"], [class*="px-"], [class*="py-"]');
    cards.forEach(card => {
      if (card instanceof HTMLElement) {
        if (card.classList.contains('p-6') || card.classList.contains('p-5') || card.classList.contains('p-4')) {
          card.style.padding = '6px';
        }
        if (card.classList.contains('px-6') || card.classList.contains('px-5') || card.classList.contains('px-4')) {
          card.style.paddingLeft = '6px';
          card.style.paddingRight = '6px';
        }
        if (card.classList.contains('py-6') || card.classList.contains('py-5') || card.classList.contains('py-4')) {
          card.style.paddingTop = '6px';
          card.style.paddingBottom = '6px';
        }
      }
    });
    
    // Append styles for PDF rendering
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Ensure Roboto font is loaded */
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      /* Make sure all content fits on page */
      * {
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif !important;
        margin-block: 0;
      }
      
      /* Reduce spacing significantly */
      p, h1, h2, h3, h4, h5, h6 {
        margin-block: 1px !important;
        line-height: 1.1 !important;
      }
      
      /* Hide button elements */
      button, [data-pdf-remove="true"] {
        display: none !important;
      }
      
      /* Optimize padding and spacing */
      .p-6, .p-5, .p-4 {
        padding: 6px !important;
      }
      
      .p-3 {
        padding: 4px !important;
      }
      
      .space-y-4, .space-y-6, .space-y-8 {
        margin-top: 4px !important;
        margin-bottom: 4px !important;
      }
      
      /* Optimize grids for space */
      .grid {
        gap: 4px !important;
      }
      
      /* Compress header */
      [class*="rounded-t-lg"] {
        padding-top: 4px !important;
        padding-bottom: 4px !important;
      }
      
      /* Reduce all margins */
      [class*="mt-"], [class*="mb-"], [class*="my-"] {
        margin-top: 2px !important;
        margin-bottom: 2px !important;
      }
      
      /* Make all text smaller */
      body, p, span, div, li, td {
        font-size: 9px !important;
      }
      
      /* Preserve colors and backgrounds */
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        background-color: white;
      }
    `;
    
    // Add the element to the temporary container
    tempContainer.appendChild(styleElement);
    tempContainer.appendChild(clonedElement);
    
    // Append to document body temporarily
    document.body.appendChild(tempContainer);
    
    try {
      // Wait a moment to ensure fonts and styles are loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Create PDF using html2canvas with compression optimized for single page
      const canvas = await html2canvas(clonedElement, {
        scale: 1.5, // Reduced for better compression
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calculate height based on aspect ratio
      const contentRatio = canvas.height / canvas.width;
      const imgHeight = imgWidth * contentRatio;
      
      // Escala de compressão para garantir que tudo caiba em uma única página
      const compressionRatio = imgHeight > pageHeight ? pageHeight / imgHeight : 1;
      const finalHeight = imgHeight * compressionRatio;
      
      // Adicionar a imagem ao PDF, comprimindo se necessário para caber em uma página
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.85), // Qualidade reduzida para comprimir mais
        'JPEG', 
        0, // x
        0, // y
        imgWidth, // width
        finalHeight // height comprimida para caber na página
      );
      
      // Save the PDF
      pdf.save(fileName);
      
    } finally {
      // Clean up the temporary DOM element
      document.body.removeChild(tempContainer);
    }
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
