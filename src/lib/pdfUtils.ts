
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

    // Apply PDF-specific styling for a more simple and clean layout
    const pdfStyle = document.createElement('style');
    pdfStyle.textContent = `
      @page { margin: 15mm; }
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.3;
      }
      p { margin: 0.5em 0; }
      .page-break { page-break-after: always; }
      button, [data-pdf-remove="true"] { display: none !important; }
      table { page-break-inside: avoid; width: 100%; border-collapse: collapse; }
      td, th { padding: 4px; }
      .section { page-break-inside: avoid; margin-bottom: 10px; }
      h3, h4 { margin: 0.7em 0 0.3em 0; page-break-after: avoid; }
      .gradient-bg { background: none !important; }
      .border { border: 1px solid #ddd; }
      .rounded { border-radius: 0; }
      .shadow { box-shadow: none; }
      /* Simplify all visual elements */
      .bg-gradient-to-br, .hover\\:bg-af-blue-50 { background: none !important; }
    `;
    document.head.appendChild(pdfStyle);

    // Hide elements that shouldn't appear in the PDF
    const elementsToHide = proposalElement.querySelectorAll('[data-pdf-remove="true"]');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
    
    try {
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

      // Calculate the dimensions
      const contentWidth = 180; // A4 width minus margins in mm
      const contentHeight = 267; // A4 height minus margins in mm

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

          // Add page break markers to section headers
          const sectionHeaders = documentClone.querySelectorAll('.section-header, h3, h4, table');
          sectionHeaders.forEach(header => {
            if (header instanceof HTMLElement) {
              header.dataset.pdfSectionHeader = 'true';
              header.style.pageBreakBefore = 'auto';
              header.style.pageBreakAfter = 'avoid';
            }
          });
          
          // Mark table rows to stay together
          const tableRows = documentClone.querySelectorAll('tr');
          tableRows.forEach(row => {
            if (row instanceof HTMLElement) {
              row.style.pageBreakInside = 'avoid';
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
          15, // X position (margin)
          15, // Y position (margin)
          contentWidth,
          (sourceHeight * contentWidth) / initialCanvas.width
        );
        
        // Add page number
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Página ${i + 1} de ${totalPages}`, contentWidth / 2, contentHeight + 10, { align: 'center' });
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
