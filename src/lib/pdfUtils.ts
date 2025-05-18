
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
      /* Reset border-radius for print */
      .rounded-lg, .rounded-md, .rounded { border-radius: 0 !important; }
      
      /* Hide SVG icons in print */
      svg { display: none !important; }
      
      /* Set consistent spacing */
      .mr-1, .mr-2 { margin-right: 4px !important; }
      .print\\:hidden { display: none !important; }
      
      /* Font size adjustments */
      .text-xs { font-size: 8px !important; }
      .text-sm { font-size: 10px !important; }
      .text-base { font-size: 11px !important; }
      .text-lg { font-size: 12px !important; }
      .text-xl { font-size: 13px !important; }
      .text-2xl { font-size: 14px !important; }
      .text-3xl { font-size: 16px !important; }
      
      /* Compact spacing */
      .p-1, .p-2, .p-3, .p-4, .p-5, .p-6 { padding: 4px !important; }
      .px-1, .px-2, .px-3, .px-4, .px-5, .px-6 { padding-left: 4px !important; padding-right: 4px !important; }
      .py-1, .py-2, .py-3, .py-4, .py-5, .py-6 { padding-top: 4px !important; padding-bottom: 4px !important; }
      .m-1, .m-2, .m-3, .m-4, .m-5, .m-6 { margin: 4px !important; }
      .mx-1, .mx-2, .mx-3, .mx-4, .mx-5, .mx-6 { margin-left: 4px !important; margin-right: 4px !important; }
      .my-1, .my-2, .my-3, .my-4, .my-5, .my-6 { margin-top: 4px !important; margin-bottom: 4px !important; }
      .gap-1, .gap-2, .gap-3, .gap-4, .gap-5, .gap-6 { gap: 4px !important; }
      .space-y-1, .space-y-2, .space-y-3, .space-y-4, .space-y-5, .space-y-6 { margin-top: 4px !important; margin-bottom: 4px !important; }
      
      /* Fix background colors */
      body {
        background-color: ${colors.background} !important;
      }
      
      /* Remove action buttons from PDF */
      [data-pdf-remove="true"] {
        display: none !important;
      }
    `;
    
    clonedElement.appendChild(styleElement);
    
    // Add to DOM temporarily, but invisible
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '-9999px';
    clonedElement.style.width = '210mm'; // A4 width
    document.body.appendChild(clonedElement);
    
    // Hide action buttons
    const actionButtons = clonedElement.querySelectorAll('.pdf-action-buttons');
    actionButtons.forEach(button => {
      button.setAttribute('data-pdf-remove', 'true');
    });
    
    // Now capture the element
    const canvas = await html2canvas(clonedElement, {
      scale: 2, // Balance quality and file size
      useCORS: true,
      allowTaint: true,
      backgroundColor: colors.background,
      logging: false,
      width: 595, // A4 width in points at 72dpi
      height: 842, // A4 height in points at 72dpi
      onclone: (clonedDoc) => {
        // Remove all SVG icons to save space
        const icons = clonedDoc.querySelectorAll('svg');
        icons.forEach(icon => {
          if (icon instanceof Element) {
            icon.style.display = 'none';
          }
        });
        
        // Make text smaller for PDF
        const textElements = clonedDoc.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
        textElements.forEach(el => {
          const element = el as HTMLElement;
          if (element.classList.contains('text-xs')) {
            element.style.fontSize = '8px';
          } else if (element.classList.contains('text-sm')) {
            element.style.fontSize = '9px';
          } else if (element.classList.contains('text-base')) {
            element.style.fontSize = '10px';
          } else if (element.classList.contains('text-lg')) {
            element.style.fontSize = '11px';
          } else if (element.classList.contains('text-xl')) {
            element.style.fontSize = '12px';
          } else if (element.classList.contains('text-2xl')) {
            element.style.fontSize = '13px';
          } else if (element.classList.contains('text-3xl')) {
            element.style.fontSize = '14px';
          } else {
            element.style.fontSize = '10px';
          }
        });
        
        // Make padding/margins smaller
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          
          // Replace padding
          if (element.style.padding) element.style.padding = '4px';
          if (element.style.paddingTop) element.style.paddingTop = '2px';
          if (element.style.paddingBottom) element.style.paddingBottom = '2px';
          if (element.style.paddingLeft) element.style.paddingLeft = '4px';
          if (element.style.paddingRight) element.style.paddingRight = '4px';
          
          // Replace margins
          if (element.style.margin) element.style.margin = '2px';
          if (element.style.marginTop) element.style.marginTop = '2px';
          if (element.style.marginBottom) element.style.marginBottom = '2px';
          if (element.style.marginLeft) element.style.marginLeft = '2px';
          if (element.style.marginRight) element.style.marginRight = '2px';
        });
        
        // Remove action buttons
        const buttons = clonedDoc.querySelectorAll('button, [data-pdf-remove="true"]');
        buttons.forEach(button => {
          if (button instanceof HTMLElement) {
            button.style.display = 'none';
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
    
    // Add the image of the element to the PDF with appropriate margins
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
