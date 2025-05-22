
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExtractedData } from './types';
import { hasDates, createSafeFileName } from './helpers';
import { hideUnnecessaryElements, restoreHiddenElements, createTemporaryClone, cleanupTemporaryElement } from './dom-utils';
import { generateMainPageContent, generatePaymentSchedulePage } from './content-generator';

export async function generateProposalPdf(proposalElement: HTMLElement, data: Partial<ExtractedData>): Promise<void> {
  try {
    // Get filename
    const fileName = createSafeFileName(data, 'pdf');

    // Wait for a complete render cycle and fonts to load
    await new Promise(resolve => setTimeout(resolve, 300));
    await document.fonts.ready;

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Set PDF document properties
    pdf.setProperties({
      title: `Proposta PGFN - ${data.clientName || data.cnpj || 'Cliente'}`,
      subject: 'Proposta de Transação Tributária | PGFN',
      author: 'Aliança Fiscal',
      creator: 'Sistema de Propostas'
    });

    // Determine number of pages
    let numberOfPages = 1; // Start with one page (main content)
    
    // Add payment schedule page if we have dates
    if (hasDates(data)) {
      numberOfPages++;
    }

    // Hide elements that shouldn't appear in the export
    hideUnnecessaryElements(proposalElement);

    // Create a temporary clone of the proposal element for each page
    for (let pageIndex = 0; pageIndex < numberOfPages; pageIndex++) {
      // Create a temporary clone for this page
      const { tempDiv, cloneElement } = createTemporaryClone(proposalElement, pageIndex);
      
      // Get the content div where we'll insert our HTML
      const contentDiv = cloneElement.querySelector('.p-0') || cloneElement;
      
      if (contentDiv instanceof HTMLElement) {
        // Handle multi-page content
        if (cloneElement.querySelector('[data-page]')) {
          // Set the current page if we have pagination
          const pageContentElements = cloneElement.querySelectorAll('[data-page]');
          pageContentElements.forEach(el => {
            if (el instanceof HTMLElement) {
              if (el.getAttribute('data-page') === pageIndex.toString()) {
                el.style.display = '';
              } else {
                el.style.display = 'none';
              }
            }
          });
        } else {
          // Set up correct content for this page directly
          if (pageIndex === 0) {
            // Main content
            contentDiv.innerHTML = generateMainPageContent(data);
          } else if (pageIndex === 1) {
            // Payment schedule
            contentDiv.innerHTML = generatePaymentSchedulePage(data, numberOfPages);
          }
        }
      }
      
      // Capture the page with html2canvas
      const canvas = await html2canvas(cloneElement, {
        scale: 2, // Better balance between quality and file size
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions to fit on PDF page
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 210 - 20; // A4 width minus margins
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add a new page if not the first page
      if (pageIndex > 0) {
        pdf.addPage();
      }
      
      // Add the captured image to PDF
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight, '', 'FAST');
      
      // Clean up temporary element
      cleanupTemporaryElement(tempDiv);
    }

    // Restore visibility of hidden elements
    restoreHiddenElements(proposalElement);

    // Save the PDF
    pdf.save(fileName);
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
