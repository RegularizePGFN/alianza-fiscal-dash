
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
      subject: 'Proposta de Parcelamento PGFN',
      author: 'Aliança Fiscal',
      creator: 'Sistema de Propostas'
    });

    // Find the main content and payment schedule separately
    const mainContent = proposalElement.querySelector('.main-content');
    const paymentSchedule = proposalElement.querySelector('.page-break-before');

    if (!mainContent) {
      return Promise.reject(new Error('Main content not found'));
    }

    // Function to add an element to PDF
    const addElementToPDF = async (element: Element, isNewPage = false) => {
      if (isNewPage) {
        pdf.addPage();
      }

      // Create a temporary clone for rendering
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.backgroundColor = '#fff';
      tempDiv.appendChild(element.cloneNode(true));
      document.body.appendChild(tempDiv);

      // Remove buttons and other non-printable elements
      const toRemove = tempDiv.querySelectorAll('button, [data-pdf-remove="true"]');
      toRemove.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      // Capture the element
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Clean up
      document.body.removeChild(tempDiv);

      // Add to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 210 - 20; // A4 width minus margins
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight, '', 'FAST');

      return pdfHeight;
    };

    // Add main content (first page)
    await addElementToPDF(mainContent);

    // Add payment schedule if it exists (on a new page)
    if (paymentSchedule) {
      await addElementToPDF(paymentSchedule, true);
    }

    // Add page numbers
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Página ${i} de ${totalPages}`, 210 / 2, 297 - 10, { align: 'center' });
    }

    // Save the PDF
    pdf.save(fileName);
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
