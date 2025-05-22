
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';

// Generate PDF from HTML element
export const generateProposalPdf = async (
  element: HTMLElement,
  proposalData: Partial<ExtractedData>,
  returnBlob = false
): Promise<void | Blob> => {
  try {
    // Get element dimensions
    const { offsetWidth, offsetHeight } = element;
    
    // Add a temporary style to handle page breaks in PDF
    const style = document.createElement('style');
    style.textContent = `
      .page-break-before { page-break-before: always; }
      .print:break-before-page { page-break-before: always; }
      @media print { 
        .page-break-before { page-break-before: always; }
        .print\\:break-before-page { page-break-before: always; }
      }
    `;
    document.head.appendChild(style);
    
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      windowWidth: offsetWidth,
      windowHeight: offsetHeight,
      logging: false, // Set to true for debugging
    });
    
    // Remove the temporary style
    document.head.removeChild(style);
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
      hotfixes: ['px_scaling'],
    });
    
    // Calculate PDF dimensions
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Get the client name or use a default
    const clientName = proposalData.clientName || 'proposta';
    const fileName = `${clientName.toLowerCase().replace(/\s+/g, '_')}_proposta.pdf`;
    
    if (returnBlob) {
      // Return Blob for further processing (for MinIO upload)
      const blob = pdf.output('blob');
      return blob;
    } else {
      // Save PDF directly
      pdf.save(fileName);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Generate PNG from HTML element
export const generateProposalPng = async (
  element: HTMLElement,
  proposalData: Partial<ExtractedData>,
  returnBlob = false
): Promise<void | Blob> => {
  try {
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      logging: false,
      width: element.offsetWidth,
      height: element.scrollHeight || element.offsetHeight,
    });
    
    if (returnBlob) {
      // Return Blob for further processing (for MinIO upload)
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } else {
      // Get the client name or use a default
      const clientName = proposalData.clientName || 'proposta';
      const fileName = `${clientName.toLowerCase().replace(/\s+/g, '_')}_proposta.png`;
      
      // Create download link
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw error;
  }
};

// Get proposal HTML content as string
export const getProposalHtml = (element: HTMLElement): string => {
  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  
  // Remove elements that should not be included in the export
  const elementsToRemove = clonedElement.querySelectorAll('[data-pdf-remove="true"]');
  elementsToRemove.forEach(el => el.parentNode?.removeChild(el));
  
  // Add necessary styles for proper rendering
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
    }
    @page {
      size: A4;
      margin: 0;
    }
    .page-break-before { 
      page-break-before: always; 
    }
    .print\\:break-before-page { 
      page-break-before: always; 
    }
  `;
  
  // Create a full HTML document
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Proposta</title>
      ${style.outerHTML}
    </head>
    <body>
      ${clonedElement.outerHTML}
    </body>
    </html>
  `;
  
  return html;
};
