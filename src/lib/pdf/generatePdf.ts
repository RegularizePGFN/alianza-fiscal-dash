
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from '../types/proposals';

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
    proposalClone.style.minHeight = '297mm'; // A4 height
    
    // Apply PDF-specific styling to the clone
    const pdfStyle = document.createElement('style');
    pdfStyle.textContent = `
      @page { margin: 0; padding: 0; }
      body { font-family: 'Roboto', Arial, sans-serif; margin: 0; padding: 0; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      p { margin: 0; padding: 0; }
      button, [data-pdf-remove="true"] { display: none !important; }
      table { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
      tr { page-break-inside: avoid; }
      td, th { padding: 4px; }
      h3, h4 { margin-top: 6px; margin-bottom: 3px; }
      .section { page-break-inside: avoid; }
      
      /* Remove all rounded corners, borders and shadows */
      .rounded, .rounded-lg, .rounded-md, .rounded-sm, .rounded-xl, .rounded-2xl { border-radius: 0 !important; }
      .card { border: none; margin: 0; padding: 0; }
      .card-content { padding: 6px; }
      
      /* Override any complex gradients or shadows */
      .shadow, .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
      .bg-gradient-to-br { background: white !important; }
      
      /* Ensure footer appears at the bottom of each page */
      .print\\:fixed { position: fixed !important; }
      .print\\:bottom-0 { bottom: 0 !important; }
      .print\\:left-0 { left: 0 !important; }
      .print\\:right-0 { right: 0 !important; }
    `;
    
    proposalClone.appendChild(pdfStyle);
    
    // Hide elements that shouldn't appear in the PDF
    const elementsToHide = proposalClone.querySelectorAll('button, [data-pdf-remove="true"]');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
    
    // Create PDF with A4 dimensions and no margins
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Wait for content to be properly styled
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Set PDF document properties
    pdf.setProperties({
      title: `Proposta PGFN - ${data.clientName || data.cnpj || 'Cliente'}`,
      subject: 'Proposta de Parcelamento PGFN',
      author: 'Aliança Fiscal',
      creator: 'Sistema de Propostas'
    });
    
    // Function to add content to PDF
    const renderPDF = async () => {
      // A4 dimensions in pixels (assuming 96 DPI)
      const a4Width = 210; // mm
      const a4Height = 297; // mm
      const pdfWidth = a4Width; // use full width with no margins
      const pdfHeight = a4Height; // use full height with no margins
      
      // Use html2canvas to render the clone element
      const canvas = await html2canvas(proposalClone, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: proposalClone.scrollWidth,
        height: proposalClone.scrollHeight
      });
      
      // Calculate how many pages we need
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgWidth = pdfWidth;
      const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;
      
      // Add the image to the PDF with no margins
      pdf.addImage(imgData, 'PNG', 0, 0, pdfImgWidth, pdfImgHeight, '', 'FAST');
      
      let heightLeft = pdfImgHeight;
      let position = 0;
      
      // Add additional pages if needed, without page numbers and without margins
      while (heightLeft > pdfHeight) {
        position += pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -(position), pdfImgWidth, pdfImgHeight, '', 'FAST');
        heightLeft -= pdfHeight;
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
