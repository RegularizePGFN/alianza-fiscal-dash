
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
    tempContainer.style.width = '794px'; // A4 width in pixels at 96dpi
    tempContainer.style.padding = '0';
    tempContainer.style.margin = '0 auto';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.transform = 'scale(0.90)';
    tempContainer.style.transformOrigin = 'top center';
    
    // Hide action buttons
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"], button');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
      }
    });
    
    // Reduce spacing between elements
    const sections = clonedElement.querySelectorAll('div.space-y-4, div.mb-6, div.mt-8, div.gap-6');
    sections.forEach(section => {
      if (section instanceof HTMLElement) {
        section.style.marginTop = '4px';
        section.style.marginBottom = '4px';
        section.style.gap = '4px';
        section.classList.remove('space-y-4', 'mb-6', 'mt-8');
        section.classList.add('space-y-2', 'mb-2', 'mt-2');
      }
    });
    
    // Compress grids to save space
    const grids = clonedElement.querySelectorAll('.grid');
    grids.forEach(grid => {
      if (grid instanceof HTMLElement) {
        grid.style.gap = '6px';
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
        page-break-inside: avoid !important;
      }
      
      /* Reduce spacing */
      p, h1, h2, h3, h4, h5, h6 {
        margin-block: 2px !important;
        line-height: 1.3 !important;
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
      
      .space-y-4 {
        margin-top: 4px !important;
        margin-bottom: 4px !important;
      }
      
      /* Optimize grids for space */
      .grid {
        gap: 6px !important;
      }
      
      /* Compress header */
      [class*="rounded-t-lg"] {
        padding-top: 6px !important;
        padding-bottom: 6px !important;
      }
      
      /* Preserve colors and backgrounds */
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        background-color: white;
      }
      
      /* Card container optimization */
      .card {
        max-width: 794px !important;
        margin: 0 auto !important;
        transform: scale(0.90) !important;
        transform-origin: top center !important;
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
        // Define max height for A4
        height: clonedElement.offsetHeight,
        windowHeight: clonedElement.offsetHeight,
        // Apply scaling to fit in a single page
        onclone: (document, element) => {
          const contentHeight = element.offsetHeight;
          const maxA4Height = 1123; // pixels for A4 @ 96 dpi
          
          if (contentHeight > maxA4Height) {
            // Scale down to fit on a single page
            const scaleFactor = Math.min(0.90, maxA4Height / contentHeight);
            element.style.transform = `scale(${scaleFactor})`;
            element.style.transformOrigin = 'top center';
            element.style.width = `${100 / scaleFactor}%`;
            element.style.height = `${maxA4Height}px`;
          }
        }
      });
      
      // Calculate dimensions for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calculate proportional height to fit on a single page
      const contentRatio = canvas.height / canvas.width;
      const imgHeight = Math.min(imgWidth * contentRatio, pageHeight - 10);
      
      // Initialize PDF - compressed high quality mode
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Add image content to PDF - center vertically if shorter than page
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
