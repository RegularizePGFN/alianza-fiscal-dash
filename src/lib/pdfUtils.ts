
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';

export async function generateProposalPng(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Wait for a complete render cycle and fonts to load
    await new Promise(resolve => setTimeout(resolve, 300));
    await document.fonts.ready;
    
    // Get seller name for filename
    const seller = data.sellerName ? 
      data.sellerName.replace(/[^\w]/g, '_').toLowerCase() : 'vendedor';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${seller}.png`;

    // Store original styles to restore them later
    const originalStyles = new Map();
    
    // Temporarily hide elements that shouldn't be in the export
    const elementsToHide = proposalElement.querySelectorAll('[data-pdf-remove="true"]');
    elementsToHide.forEach((el, index) => {
      if (el instanceof HTMLElement) {
        originalStyles.set(`hide-${index}`, {
          element: el,
          display: el.style.display
        });
        el.style.display = 'none';
      }
    });

    // Take the screenshot at high resolution - exactly as shown in browser
    const canvas = await html2canvas(proposalElement, {
      scale: 4, // Higher scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
      onclone: (documentClone) => {
        // Find and hide buttons of action in the clone
        const actionButtons = documentClone.querySelectorAll('button, [data-pdf-remove="true"]');
        actionButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.style.display = 'none';
          }
        });
      }
    });
    
    // Restore original styles
    originalStyles.forEach((style, key) => {
      if (key.startsWith('hide-')) {
        style.element.style.display = style.display;
      }
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
    tempContainer.style.fontSize = '10px'; // Reduzir tamanho da fonte para otimizar espaço
    
    // Hide action buttons
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
      }
    });
    
    // Reduzir espaçamento entre elementos
    const sections = clonedElement.querySelectorAll('div.space-y-4, div.mb-6, div.mt-8');
    sections.forEach(section => {
      if (section instanceof HTMLElement) {
        section.style.marginTop = '8px';
        section.style.marginBottom = '8px';
        section.classList.remove('space-y-4', 'mb-6', 'mt-8');
        section.classList.add('space-y-2', 'mb-3', 'mt-2');
      }
    });
    
    // Comprimir elementos e grids para economizar espaço
    const grids = clonedElement.querySelectorAll('.grid');
    grids.forEach(grid => {
      if (grid instanceof HTMLElement) {
        grid.style.gap = '8px';
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
      
      /* Reduce spacing */
      p, h1, h2, h3, h4, h5, h6 {
        margin-block: 2px !important;
      }
      
      /* Hide button elements */
      button, [data-pdf-remove="true"] {
        display: none !important;
      }
      
      /* Optimize padding and spacing */
      .p-6, .p-5, .p-4 {
        padding: 8px !important;
      }
      
      .p-3 {
        padding: 6px !important;
      }
      
      .space-y-4 {
        margin-top: 8px !important;
        margin-bottom: 8px !important;
      }
      
      /* Optimize grids for space */
      .grid {
        gap: 8px !important;
      }
      
      /* Compress header */
      [class*="rounded-t-lg"] {
        padding-top: 8px !important;
        padding-bottom: 8px !important;
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
      
      // Create PDF using html2canvas
      const canvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calcular altura proporcional para manter proporção do conteúdo
      const contentRatio = canvas.height / canvas.width;
      const imgHeight = imgWidth * contentRatio;
      
      // Se o conteúdo for maior que uma página A4, vamos dividi-lo em múltiplas páginas
      if (imgHeight <= pageHeight) {
        // Conteúdo cabe em uma única página
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95), 
          'JPEG', 
          0, // x
          0, // y
          imgWidth, // width
          imgHeight // height
        );
      } else {
        // Conteúdo precisa de várias páginas
        let heightLeft = imgHeight;
        let position = 0;
        let page = 0;
        
        while (heightLeft > 0) {
          // Adicionar nova página se não for a primeira
          if (page > 0) {
            pdf.addPage();
          }
          
          // Adicionar parte da imagem correspondente a esta página
          pdf.addImage(
            canvas.toDataURL('image/jpeg', 0.95),
            'JPEG',
            0, // x
            position > 0 ? -position : 0, // Posição vertical negativa para "recortar" a parte certa
            imgWidth,
            imgHeight
          );
          
          // Reduzir altura restante e incrementar posição
          heightLeft -= pageHeight;
          position += pageHeight;
          page++;
        }
      }
      
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
