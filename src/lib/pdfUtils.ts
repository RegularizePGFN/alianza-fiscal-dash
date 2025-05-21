
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

    // Remover elementos que não devem aparecer na exportação
    const elementsToHide = proposalElement.querySelectorAll('[data-pdf-remove="true"]');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });

    // Capture the content exactly as it appears on screen without modifications
    const canvas = await html2canvas(proposalElement, {
      scale: 2, // Melhor balanço entre qualidade e tamanho de arquivo
      useCORS: true, // Enable CORS for any images
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff', // Usar fundo branco para evitar transparência
      imageTimeout: 0, // No timeout for image loading
      onclone: (documentClone) => {
        // Encontrar e esconder botões de ação no clone
        const actionButtons = documentClone.querySelectorAll('button, [data-pdf-remove="true"]');
        actionButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.style.display = 'none';
          }
        });
      }
    });
    
    // Restaurar a visibilidade dos elementos escondidos
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = '';
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
    // Get seller name for filename
    const seller = data.sellerName ? 
      data.sellerName.replace(/[^\w]/g, '_').toLowerCase() : 'vendedor';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${seller}.pdf`;

    // Clone the element to avoid modifying the original
    const clonedElement = proposalElement.cloneNode(true) as HTMLElement;
    
    // Create a temporary container for the PDF content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    
    // Hide action buttons and items that shouldn't be in PDF
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
      }
    });
    
    // Scale and optimize content for PDF
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
      
      * {
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif !important;
        margin-block: 0;
      }
      
      p, h1, h2, h3, h4, h5, h6 {
        margin-block: 2px !important;
      }
      
      button, [data-pdf-remove="true"] {
        display: none !important;
      }
      
      .p-6, .p-5, .p-4 {
        padding: 8px !important;
      }
      
      .p-3 {
        padding: 6px !important;
      }
      
      /* Page break utilities */
      .pdf-page-break {
        page-break-after: always;
        break-after: page;
      }
      
      /* Ensure tables don't break across pages */
      table {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      /* Ensure sections don't break in the middle */
      .border-l-4 {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        background-color: white;
      }
    `;
    
    tempContainer.appendChild(styleElement);
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);
    
    try {
      // Wait to ensure fonts and styles are loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Set PDF properties
      pdf.setProperties({
        title: `Proposta PGFN - ${data.clientName || data.cnpj || 'Cliente'}`,
        subject: 'Proposta de Parcelamento PGFN',
        author: 'Aliança Fiscal',
        keywords: 'proposta, pgfn, parcelamento',
        creator: 'Sistema de Propostas Aliança Fiscal'
      });
      
      // Add a function to insert page numbers
      const totalPages = 1; // Will be updated later
      
      // Create PDF using html2canvas with better page break handling
      // First, calculate total height to determine number of pages
      const contentWidth = 210; // A4 width in mm
      const contentHeight = 297 - 20; // A4 height minus margins in mm
      
      // Get sections that might need page breaks
      const sections = clonedElement.querySelectorAll('.border-l-4, table, .mb-6');
      
      // First pass: render the entire document to a large canvas
      const fullCanvas = await html2canvas(clonedElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions for A4
      const imgWidth = contentWidth; // A4 width in mm
      const imgHeight = (fullCanvas.height * imgWidth) / fullCanvas.width;
      
      // Calculate number of pages
      const pagesCount = Math.ceil(imgHeight / contentHeight);
      
      // Add content page by page with proper breaks
      for (let i = 0; i < pagesCount; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate position to start capturing from
        const sourceY = i * (fullCanvas.height / pagesCount);
        const sourceHeight = fullCanvas.height / pagesCount;
        
        // Create a new canvas for this page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = fullCanvas.width;
        pageCanvas.height = sourceHeight;
        
        const context = pageCanvas.getContext('2d');
        if (!context) continue;
        
        // Copy portion of the full canvas to this page canvas
        context.drawImage(
          fullCanvas, 
          0, sourceY, // Source x, y
          fullCanvas.width, sourceHeight, // Source width, height
          0, 0, // Destination x, y
          fullCanvas.width, sourceHeight // Destination width, height
        );
        
        // Add to PDF
        pdf.addImage(
          pageCanvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          0, // x
          10, // y (add some margin)
          imgWidth,
          contentHeight
        );
        
        // Add page number at the bottom
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Página ${i + 1}/${pagesCount}`, imgWidth / 2, contentHeight + 15, { align: 'center' });
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
