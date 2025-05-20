
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';

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
    
    // Hide action buttons
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
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
      }
      
      /* Hide button elements */
      button, [data-pdf-remove="true"] {
        display: none !important;
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
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const heightLeft = imgHeight;
      
      // Initialize PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const position = 0;
      
      // Add image content to PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95), 
        'JPEG', 
        0, 
        position, 
        imgWidth, 
        imgHeight
      );
      
      // If content is longer than a page, add additional pages
      let heightLeftAfterFirstPage = heightLeft - pageHeight;
      let currentPage = 1;
      
      while (heightLeftAfterFirstPage > 0) {
        currentPage++;
        const position = -pageHeight * (currentPage - 1);
        
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95), 
          'JPEG', 
          0, 
          position, 
          imgWidth, 
          imgHeight
        );
        
        heightLeftAfterFirstPage -= pageHeight;
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
