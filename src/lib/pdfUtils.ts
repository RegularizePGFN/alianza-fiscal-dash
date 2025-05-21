
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';

// Helper function to format dates as dd/mm/yyyy
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR');
};

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

    // Hide elements that shouldn't appear in the export
    const elementsToHide = proposalElement.querySelectorAll('[data-pdf-remove="true"]');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });

    // Capture the content with high quality
    const canvas = await html2canvas(proposalElement, {
      scale: 2, // Better balance between quality and file size
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
      onclone: (documentClone) => {
        // Find and hide action buttons in the clone
        const actionButtons = documentClone.querySelectorAll('button, [data-pdf-remove="true"]');
        actionButtons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.style.display = 'none';
          }
        });
      }
    });
    
    // Restore visibility of hidden elements
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = '';
      }
    });
    
    // Create download link for PNG
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 1.0); // Maximum quality
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

    // Apply PDF-specific styling
    const pdfStyle = document.createElement('style');
    pdfStyle.textContent = `
      @page { margin: 10mm; }
      body { font-family: 'Roboto', Arial, sans-serif; }
      p { margin: 0; padding: 0; }
      .page-break { page-break-after: always; }
      button, [data-pdf-remove="true"] { display: none !important; }
      table { page-break-inside: avoid; }
      .section { page-break-inside: avoid; }
    `;
    document.head.appendChild(pdfStyle);

    // Create a PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Set PDF document properties
    pdf.setProperties({
      title: `Proposta PGFN - ${data.clientName || data.cnpj || 'Cliente'}`,
      subject: 'Proposta de Parcelamento PGFN',
      author: 'Aliança Fiscal',
      creator: 'Sistema de Propostas'
    });

    // Hide elements that shouldn't appear in the PDF
    const elementsToHide = proposalElement.querySelectorAll('[data-pdf-remove="true"]');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
    
    try {
      // Calculate the dimensions
      const contentWidth = 210 - 20; // A4 width minus margins in mm
      const contentHeight = 297 - 20; // A4 height minus margins in mm

      // First, calculate the total height to determine number of pages
      const initialCanvas = await html2canvas(proposalElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (documentClone) => {
          // Find and hide action buttons in the clone
          const actionButtons = documentClone.querySelectorAll('button, [data-pdf-remove="true"]');
          actionButtons.forEach(button => {
            if (button instanceof HTMLElement) {
              button.style.display = 'none';
            }
          });

          // Mark section headers for page breaks if needed
          const sectionHeaders = documentClone.querySelectorAll('.section-header, h3, table');
          sectionHeaders.forEach(header => {
            if (header instanceof HTMLElement) {
              header.dataset.pdfSectionHeader = 'true';
            }
          });
        }
      });

      // Determine the number of pages needed
      const pageHeight = contentHeight * initialCanvas.width / contentWidth;
      const totalPages = Math.ceil(initialCanvas.height / pageHeight);
      
      // Process each page
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the portion of the canvas for this page
        const sourceY = i * pageHeight;
        const sourceHeight = Math.min(pageHeight, initialCanvas.height - sourceY);
        
        // Add page content
        pdf.addImage(
          initialCanvas, 
          'PNG',
          10, // X position (margin)
          10, // Y position (margin)
          contentWidth,
          (sourceHeight * contentWidth) / initialCanvas.width
        );
        
        // Add page number
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Página ${i + 1} de ${totalPages}`, contentWidth / 2 + 10, contentHeight + 10, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(fileName);
    } finally {
      // Restore visibility of hidden elements
      elementsToHide.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = '';
        }
      });
      
      // Remove the temporary style
      document.head.removeChild(pdfStyle);
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
