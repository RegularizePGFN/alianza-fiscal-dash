
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

    // Create a temporary clone of the proposal element for PDF generation
    const proposalClone = proposalElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(proposalClone);
    proposalClone.style.position = 'absolute';
    proposalClone.style.left = '-9999px';
    proposalClone.style.width = '210mm'; // A4 width
    
    // Apply PDF-specific styling to the clone
    const pdfStyle = document.createElement('style');
    pdfStyle.textContent = `
      @page { margin: 10mm; }
      body { font-family: 'Roboto', Arial, sans-serif; }
      * { box-sizing: border-box; }
      p { margin: 0; padding: 0; }
      .page-break { page-break-after: always; }
      button, [data-pdf-remove="true"] { display: none !important; }
      table { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
      tr { page-break-inside: avoid; }
      td, th { padding: 4px; }
      h3, h4 { margin-top: 8px; margin-bottom: 4px; }
      .section { page-break-inside: avoid; }
      
      /* Simple styling for cleaner PDF output */
      .card { border: 1px solid #e0e0e0; margin-bottom: 12px; }
      .card-content { padding: 8px; }
      
      /* Override any complex gradients or shadows */
      .shadow, .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
      .bg-gradient-to-br { background: white !important; }
    `;
    
    proposalClone.appendChild(pdfStyle);
    
    // Hide elements that shouldn't appear in the PDF
    const elementsToHide = proposalClone.querySelectorAll('button, [data-pdf-remove="true"]');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
    
    // Add manual page breaks before sections that should start on a new page
    const paymentSchedule = proposalClone.querySelector('[data-section="payment-schedule"]');
    if (paymentSchedule && paymentSchedule instanceof HTMLElement) {
      const pageBreak = document.createElement('div');
      pageBreak.className = 'page-break';
      paymentSchedule.parentNode?.insertBefore(pageBreak, paymentSchedule);
    }
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Wait for content to be properly styled
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get the computed height after styling (should reflect the full scrollHeight)
    const contentHeight = proposalClone.scrollHeight;
    
    // Set PDF document properties
    pdf.setProperties({
      title: `Proposta PGFN - ${data.clientName || data.cnpj || 'Cliente'}`,
      subject: 'Proposta de Parcelamento PGFN',
      author: 'Aliança Fiscal',
      creator: 'Sistema de Propostas'
    });
    
    // Function to add content to PDF page by page
    const renderPDF = async () => {
      // A4 dimensions in pixels (assuming 96 DPI)
      const a4Width = 210; // mm
      const a4Height = 297; // mm
      const pdfWidth = a4Width - 20; // subtract margins
      const pdfHeight = a4Height - 20; // subtract margins
      
      // Use html2canvas to render the clone element
      const canvas = await html2canvas(proposalClone, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate how many pages we need
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgWidth = pdfWidth;
      const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;
      
      // Add the image to the PDF, splitting across multiple pages as needed
      let heightLeft = pdfImgHeight;
      let position = 0;
      let page = 1;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, 10, pdfImgWidth, pdfImgHeight, '', 'FAST');
      heightLeft -= pdfHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position += pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, -(position - 10), pdfImgWidth, pdfImgHeight, '', 'FAST');
        heightLeft -= pdfHeight;
        page++;
      }
      
      // Add page numbers
      const totalPages = page;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Página ${i} de ${totalPages}`, a4Width / 2, a4Height - 5, { align: 'center' });
      }
      
      // Clean up
      document.body.removeChild(proposalClone);
      
      // Save the PDF
      pdf.save(fileName);
    };
    
    await renderPDF();
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
