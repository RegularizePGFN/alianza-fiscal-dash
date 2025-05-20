
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';

export async function generateProposalPng(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Get specialist name for filename
    const specialist = data.specialistName ? 
      data.specialistName.replace(/[^\w]/g, '_').toLowerCase() : 'especialista';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${specialist}.png`;

    // Clone the element to avoid modifying the original
    const clonedElement = proposalElement.cloneNode(true) as HTMLElement;
    
    // Create a temporary container for the PNG content with all necessary styles
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.padding = '0';
    tempContainer.style.margin = '0';
    tempContainer.style.backgroundColor = 'white';
    
    // Hide action buttons
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
      }
    });
    
    // Append the element to the temporary container
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);
    
    try {
      // Create PNG using html2canvas
      const scale = 2; // Higher scale for better quality
      
      // Capture the content as canvas
      const canvas = await html2canvas(clonedElement, {
        scale: scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Create a download link for the PNG
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      return Promise.resolve();
    } finally {
      // Clean up the temporary DOM element
      document.body.removeChild(tempContainer);
    }
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
      
      // Create PDF using html2canvas and jsPDF
      const scale = 2; // Higher scale for better quality
      
      // Capture the content as canvas
      const canvas = await html2canvas(clonedElement, {
        scale: scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        // Definir altura máxima para um A4
        height: clonedElement.offsetHeight,
        windowHeight: clonedElement.offsetHeight,
        // Ajustar escala para caber em uma única página
        onclone: (document, element) => {
          const contentHeight = element.offsetHeight;
          const maxA4Height = 1122; // pixels para A4 @ 96 dpi
          
          if (contentHeight > maxA4Height) {
            // Escala para caber em uma página
            const scaleFactor = maxA4Height / contentHeight;
            element.style.transform = `scale(${scaleFactor})`;
            element.style.transformOrigin = 'top left';
            element.style.width = `${100 / scaleFactor}%`;
            element.style.height = `${maxA4Height}px`;
          }
        }
      });
      
      // Calculate dimensions for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calcular altura proporcional para caber em uma página
      const contentRatio = canvas.height / canvas.width;
      const imgHeight = Math.min(imgWidth * contentRatio, pageHeight - 10);
      
      // Initialize PDF - modo comprimido de alta qualidade
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Add image content to PDF - centralizado verticalmente se menor que a página
      const yPosition = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95), 
        'JPEG', 
        0, // x
        yPosition, // y
        imgWidth, // width
        imgHeight // height
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
