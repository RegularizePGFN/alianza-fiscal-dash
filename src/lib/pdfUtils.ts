
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExtractedData } from './types/proposals';

export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Get template colors if available
    let colors = {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      background: '#FFFFFF'
    };
    
    if (data.templateColors && typeof data.templateColors === 'string') {
      try {
        const parsedColors = JSON.parse(data.templateColors);
        colors = {
          ...colors,
          ...parsedColors
        };
      } catch (e) {
        console.error('Failed to parse template colors', e);
      }
    }
    
    // Create a clone of the element to manipulate without affecting the UI
    const clonedElement = proposalElement.cloneNode(true) as HTMLElement;
    
    // Apply styles for printing to the clone
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Global PDF styles */
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Typography adjustments */
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
        color: #1a1a1a !important;
        line-height: 1.4 !important;
      }
      
      /* Reset border-radius for print */
      .rounded-lg, .rounded-md, .rounded { border-radius: 0 !important; }
      
      /* Hide action buttons in PDF */
      [data-pdf-remove="true"] { display: none !important; }
      
      /* Font size adjustments */
      .text-xs { font-size: 8px !important; }
      .text-sm { font-size: 10px !important; }
      .text-base { font-size: 11px !important; }
      .text-lg { font-size: 12px !important; }
      .text-xl { font-size: 13px !important; }
      .text-2xl { font-size: 14px !important; }
      
      /* Compact spacing */
      .p-1, .p-2, .p-3 { padding: 4px !important; }
      .p-4, .p-5, .p-6 { padding: 8px !important; }
      .px-1, .px-2, .px-3 { padding-left: 4px !important; padding-right: 4px !important; }
      .px-4, .px-5, .px-6 { padding-left: 8px !important; padding-right: 8px !important; }
      .py-1, .py-2, .py-3 { padding-top: 4px !important; padding-bottom: 4px !important; }
      .py-4, .py-5, .py-6 { padding-top: 6px !important; padding-bottom: 6px !important; }
      .m-1, .m-2, .m-3, .m-4, .m-5, .m-6 { margin: 4px !important; }
      .mx-1, .mx-2, .mx-3, .mx-4, .mx-5, .mx-6 { margin-left: 4px !important; margin-right: 4px !important; }
      .my-1, .my-2, .my-3 { margin-top: 4px !important; margin-bottom: 4px !important; }
      .my-4, .my-5, .my-6, .my-8 { margin-top: 6px !important; margin-bottom: 6px !important; }
      .mt-1, .mt-2, .mt-3, .mt-4 { margin-top: 4px !important; }
      .mb-1, .mb-2, .mb-3, .mb-4, .mb-6 { margin-bottom: 6px !important; }
      .gap-1, .gap-2, .gap-3, .gap-4 { gap: 4px !important; }
      
      /* Remove box shadows in PDF */
      .shadow, .shadow-md, .shadow-lg, .shadow-sm { box-shadow: none !important; }
      
      /* Better border display */
      .border { border-width: 1px !important; border-color: #e5e7eb !important; }
      
      /* Fix background colors */
      body {
        background-color: ${colors.background} !important;
      }
      
      /* Hide icons but preserve space */
      svg {
        visibility: hidden;
        width: 12px !important;
        height: 12px !important;
        margin-right: 4px !important;
      }
      
      /* Special case for alert sections */
      .bg-amber-50 {
        background-color: #fffbeb !important;
        border-left-color: #fbbf24 !important;
        border-left-width: 3px !important;
      }
      
      /* Special styling for the signature area */
      .border-t {
        border-top-width: 1px !important;
        border-top-color: #e5e7eb !important;
      }
      
      /* Make grid layout more compact for PDF */
      .grid { display: grid !important; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    `;
    
    clonedElement.appendChild(styleElement);
    
    // Add to DOM temporarily, but invisible
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';
    clonedElement.style.width = '210mm'; // A4 width
    clonedElement.style.padding = '10mm'; // 10mm margins
    document.body.appendChild(clonedElement);
    
    // Hide action buttons
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons, [data-pdf-remove="true"]');
    actionButtons.forEach(button => {
      if (button instanceof HTMLElement) {
        button.style.display = 'none';
      }
    });
    
    // Now capture the element
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Balance quality and file size
      useCORS: true,
      allowTaint: true,
      backgroundColor: colors.background,
      logging: false,
      windowWidth: 595, // A4 width in points at 72dpi
      windowHeight: 842, // A4 height in points at 72dpi
      onclone: (clonedDoc) => {
        // Additional styling for the PDF clone
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          
          if (element.classList.contains('bg-green-50')) {
            element.style.backgroundColor = '#f0fdf4';
          } else if (element.classList.contains('bg-gray-50')) {
            element.style.backgroundColor = '#f9fafb';
          } else if (element.classList.contains('bg-gray-800')) {
            element.style.backgroundColor = '#1f2937';
            element.style.color = '#ffffff';
          }
          
          // Remove button elements
          if (element.tagName === 'BUTTON' || element.getAttribute('data-pdf-remove') === 'true') {
            element.style.display = 'none';
          }
        });
      }
    });
    
    // Remove the clone after capture
    document.body.removeChild(clonedElement);
    
    const imgData = canvas.toDataURL('image/png');
    
    // Create a new PDF in A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate proportions to fit the image to PDF
    const imgWidth = 210; // A4 width in mm (210mm)
    const pageHeight = 297; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    // Force the image to be on a single page
    let finalImgHeight = Math.min(imgHeight, pageHeight);
    
    // Add the image of the element to the PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, finalImgHeight);

    // Get specialist name for filename
    const specialist = data.specialistName ? 
      data.specialistName.replace(/[^\w]/g, '_').toLowerCase() : 'especialista';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${specialist}.pdf`;
    
    // Download the PDF
    pdf.save(fileName);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
