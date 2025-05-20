
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData } from './types/proposals';

// Separate function for PNG generation with high quality
export async function generateProposalPng(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Wait for a complete render cycle and all fonts to load
    await new Promise(resolve => setTimeout(resolve, 200));
    await document.fonts.ready;
    
    // Get seller name for filename
    const seller = data.sellerName ? 
      data.sellerName.replace(/[^\w]/g, '_').toLowerCase() : 'vendedor';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${seller}.png`;

    // Capture the element with high resolution
    const canvas = await html2canvas(proposalElement, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      imageTimeout: 0,
    });
    
    // Create a download link for the PNG
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

// PDF generation with optimizations to fit on one page
export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Wait for fonts to load
    await document.fonts.ready;
    
    // Get specialist name for filename
    const specialist = data.specialistName || data.sellerName ? 
      (data.specialistName || data.sellerName).replace(/[^\w]/g, '_').toLowerCase() : 'especialista';
    
    // File name
    const fileName = `proposta_pgfn_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${specialist}.pdf`;

    // Create a scaled-down, compact version of the proposal for PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.style.width = '210mm'; // A4 width
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '-9999px';
    pdfContainer.style.backgroundColor = 'white';
    
    // Clone the proposal element
    const clonedProposal = proposalElement.cloneNode(true) as HTMLElement;
    
    // Add compact class to the cloned element
    clonedProposal.querySelectorAll('[class*="p-6"]').forEach(el => {
      if (el instanceof HTMLElement) {
        el.classList.remove('p-6');
        el.classList.add('p-3');
      }
    });
    
    // Reduce spacing between elements
    clonedProposal.querySelectorAll('.space-y-4, .gap-4, .mb-6, .mt-8, .pb-6').forEach(el => {
      if (el instanceof HTMLElement) {
        el.classList.remove('space-y-4', 'gap-4', 'mb-6', 'mt-8', 'pb-6');
        el.classList.add('space-y-2', 'gap-2', 'mb-3', 'mt-4', 'pb-3');
      }
    });
    
    // Reduce font sizes for PDF
    clonedProposal.querySelectorAll('h1, h2, h3, p, span, div').forEach(el => {
      if (el instanceof HTMLElement) {
        // Check if element already has a font-size style
        const currentSize = window.getComputedStyle(el).fontSize;
        const numericSize = parseFloat(currentSize);
        
        if (numericSize > 12) {
          el.style.fontSize = `${numericSize * 0.85}px`;
        }
      }
    });
    
    // Hide elements that should not be in PDF
    clonedProposal.querySelectorAll('[data-pdf-remove="true"]').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
    
    pdfContainer.appendChild(clonedProposal);
    document.body.appendChild(pdfContainer);
    
    try {
      // Initialize PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Capture the element
      const canvas = await html2canvas(clonedProposal, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions for A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calculate height proportionally
      const contentRatio = canvas.height / canvas.width;
      const imgHeight = imgWidth * contentRatio;
      
      // Check if content fits on one page
      if (imgHeight <= pageHeight) {
        // Content fits on a single page
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95), 
          'JPEG', 
          0, // x
          0, // y
          imgWidth, // width
          imgHeight // height
        );
      } else {
        // If content is too tall, scale it to fit on one page
        const scale = pageHeight / imgHeight * 0.95; // 95% of height to add some margin
        const scaledWidth = imgWidth * scale;
        
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          (imgWidth - scaledWidth) / 2, // center horizontally
          5, // add a small top margin
          scaledWidth,
          pageHeight * 0.95 // 95% of height to add some margin
        );
      }
      
      // Save the PDF
      pdf.save(fileName);
      
    } finally {
      // Clean up
      document.body.removeChild(pdfContainer);
    }
    
    return Promise.resolve();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
