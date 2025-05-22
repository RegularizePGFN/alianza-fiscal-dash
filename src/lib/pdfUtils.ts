
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

    // Create a temporary clone of the proposal element
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    // Function to render a specific page
    const renderPage = async (pageIndex: number) => {
      // Clone the original element
      const cloneElement = proposalElement.cloneNode(true) as HTMLElement;
      
      // Clear any previous content from temp div
      tempDiv.innerHTML = '';
      tempDiv.appendChild(cloneElement);
      
      // Find original content component and get its content
      const originalContent = proposalElement.querySelector('.p-6') as HTMLElement;
      if (!originalContent) {
        throw new Error('Cannot find proposal content');
      }
      
      // Get the ProposalContent component inside the clone
      const contentContainer = cloneElement.querySelector('.p-6') as HTMLElement;
      if (!contentContainer) {
        throw new Error('Cannot find content container in clone');
      }
      
      // Create page content based on page index
      if (pageIndex === 0) {
        // For first page, create a content showing header, client info, negotiation, and payment options
        const mainTemplate = document.createElement('div');
        
        // Header (always included on first page)
        const header = proposalElement.querySelector('.bg-gradient-to-r');
        if (header) {
          mainTemplate.appendChild(header.cloneNode(true));
        }
        
        // Main content (client info, negotiation, payment options)
        const mainContent = proposalElement.querySelector('.main-content');
        if (mainContent) {
          mainTemplate.appendChild(mainContent.cloneNode(true));
        }
        
        // Replace content in the clone with main page content
        contentContainer.innerHTML = '';
        contentContainer.appendChild(mainTemplate);
        
      } else {
        // For subsequent pages, show payment schedule
        // Create a simpler header for payment schedule pages
        const scheduleHeader = document.createElement('div');
        scheduleHeader.innerHTML = `
          <div class="border-b border-gray-200 pb-4 mb-6">
            <h2 class="text-xl font-semibold text-center" style="color: #1E40AF;">
              Cronograma de Pagamento
            </h2>
          </div>
        `;
        
        // Get payment schedule content from the original
        const paymentSchedule = document.createElement('div');
        
        // Try to parse payment dates
        let entryDates = [];
        let installmentDates = [];
        
        try {
          if (data.entryDates) {
            entryDates = JSON.parse(data.entryDates);
          }
          if (data.installmentDates) {
            installmentDates = JSON.parse(data.installmentDates);
          }
        } catch (error) {
          console.error('Error parsing payment dates:', error);
        }
        
        // Create entry dates table
        if (entryDates.length > 0) {
          const entryDiv = document.createElement('div');
          entryDiv.className = 'border-l-4 border-blue-500 pl-4 py-2 mb-4';
          entryDiv.innerHTML = `
            <h4 class="text-sm font-medium text-blue-700 mb-2">Entrada:</h4>
            <div class="bg-white p-3 rounded-md border border-blue-100 overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="text-xs text-gray-500">
                  <tr>
                    <th class="text-left pr-4 py-1">Parcela</th>
                    <th class="text-left pr-4 py-1">Vencimento</th>
                    <th class="text-right py-1">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  ${entryDates.map((item, index) => `
                    <tr class="${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}">
                      <td class="pr-4 py-1">${item.installment}ª</td>
                      <td class="pr-4 py-1">${item.formattedDate}</td>
                      <td class="text-right py-1">R$ ${data.entryValue}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
          paymentSchedule.appendChild(entryDiv);
        }
        
        // Create installment dates table
        if (installmentDates.length > 0) {
          const installmentDiv = document.createElement('div');
          installmentDiv.className = 'border-l-4 border-green-500 pl-4 py-2';
          installmentDiv.innerHTML = `
            <h4 class="text-sm font-medium text-green-700 mb-2">
              ${entryDates.length > 0 
                ? `Após o pagamento da entrada você pagará o restante em ${installmentDates.length} parcelas:`
                : 'Parcelas:'}
            </h4>
            <div class="bg-white p-3 rounded-md border border-green-100 overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="text-xs text-gray-500">
                  <tr>
                    <th class="text-left pr-4 py-1">Parcela</th>
                    <th class="text-left pr-4 py-1">Vencimento</th>
                    <th class="text-right py-1">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  ${installmentDates.map((item, index) => `
                    <tr class="${index % 2 === 0 ? 'bg-green-50' : 'bg-white'}">
                      <td class="pr-4 py-1">${entryDates.length + item.installment}ª</td>
                      <td class="pr-4 py-1">${item.formattedDate}</td>
                      <td class="text-right py-1">R$ ${data.installmentValue}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;
          paymentSchedule.appendChild(installmentDiv);
        }
        
        // Replace content in the clone
        contentContainer.innerHTML = '';
        contentContainer.appendChild(scheduleHeader);
        contentContainer.appendChild(paymentSchedule);
      }
      
      // Remove buttons and navigation controls
      const toRemove = cloneElement.querySelectorAll('[data-pdf-remove="true"]');
      toRemove.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      // Capture the element
      const canvas = await html2canvas(cloneElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Add to PDF
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 210 - 20; // A4 width minus margins
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add a new page if not the first page
      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight, '', 'FAST');
    };

    // Determine number of pages
    let numberOfPages = 1;
    
    // Add payment schedule page if we have dates
    try {
      const entryDates = data.entryDates ? JSON.parse(data.entryDates) : [];
      const installmentDates = data.installmentDates ? JSON.parse(data.installmentDates) : [];
      
      if (entryDates.length > 0 || installmentDates.length > 0) {
        numberOfPages++;
      }
    } catch (error) {
      console.error('Error parsing payment dates:', error);
    }

    // Generate each page
    for (let i = 0; i < numberOfPages; i++) {
      await renderPage(i);
    }

    // Clean up temporary element
    document.body.removeChild(tempDiv);

    // Add page numbers
    for (let i = 1; i <= numberOfPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Página ${i} de ${numberOfPages}`, 210 / 2, 297 - 10, { align: 'center' });
    }

    // Save the PDF
    pdf.save(fileName);
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
