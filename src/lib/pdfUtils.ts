
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ExtractedData, CompanyData } from './types/proposals';

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

    // Get the current page value to restore it later
    const activePageElement = proposalElement.querySelector('.active-page');
    const currentPage = activePageElement ? parseInt(activePageElement.getAttribute('data-page') || '0') : 0;
    
    // Need to generate multiple PNGs, one for each page
    const pages = [];
    let totalPages = 1; // Start with 1 page
    
    // Determine total pages
    try {
      const entryDates = data.entryDates ? JSON.parse(data.entryDates) : [];
      const installmentDates = data.installmentDates ? JSON.parse(data.installmentDates) : [];
      
      if (entryDates.length > 0 || installmentDates.length > 0) {
        totalPages++;
      }
    } catch (error) {
      console.error('Error parsing payment dates:', error);
    }

    // Capture each page separately
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      // Set the current page in the DOM
      const contentContainer = proposalElement.querySelector('.overflow-auto');
      if (contentContainer && contentContainer.parentElement) {
        // Find or create the content element and set the page index
        const contentElement = proposalElement.querySelector('[data-page]');
        if (contentElement) {
          contentElement.setAttribute('data-page', pageIndex.toString());
        }
        
        // Force a re-render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Capture this page
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
        
        pages.push(canvas);
      }
    }
    
    // Merge all canvases into a single image for download
    if (pages.length === 1) {
      // If only one page, just download it
      const link = document.createElement('a');
      link.download = fileName;
      link.href = pages[0].toDataURL('image/png', 1.0); // Maximum quality
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (pages.length > 1) {
      // If multiple pages, merge them vertically
      const totalHeight = pages.reduce((sum, canvas) => sum + canvas.height, 0);
      const mergedCanvas = document.createElement('canvas');
      mergedCanvas.width = pages[0].width;
      mergedCanvas.height = totalHeight;
      const ctx = mergedCanvas.getContext('2d');
      
      if (ctx) {
        let y = 0;
        pages.forEach(canvas => {
          ctx.drawImage(canvas, 0, y);
          y += canvas.height;
        });
        
        const link = document.createElement('a');
        link.download = fileName;
        link.href = mergedCanvas.toDataURL('image/png', 1.0); // Maximum quality
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    
    // Restore visibility of hidden elements and current page
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = '';
      }
    });
    
    // Restore the original page if needed
    const contentElement = proposalElement.querySelector('[data-page]');
    if (contentElement) {
      contentElement.setAttribute('data-page', currentPage.toString());
    }
    
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

    // Determine number of pages
    let numberOfPages = 1; // Start with one page (main content)
    
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

    // Create a temporary clone of the proposal element for each page
    for (let pageIndex = 0; pageIndex < numberOfPages; pageIndex++) {
      // Clone the original element
      const cloneElement = proposalElement.cloneNode(true) as HTMLElement;
      
      // Create a temporary container for this page
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '-9999px';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '794px';  // A4 width in pixels at 96 DPI
      tempDiv.style.height = '1123px'; // A4 height in pixels at 96 DPI
      document.body.appendChild(tempDiv);
      tempDiv.appendChild(cloneElement);
      
      // Hide navigation and buttons
      const elementsToHide = cloneElement.querySelectorAll('[data-pdf-remove="true"]');
      elementsToHide.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none';
        }
      });
      
      // Set the correct page in the content
      const contentDiv = cloneElement.querySelector('.overflow-auto');
      if (contentDiv) {
        // Replace the content with the appropriate page
        const contentContainer = cloneElement.querySelector('.p-0') || cloneElement;
        
        // Create a new content element for this page
        const pageContent = document.createElement('div');
        pageContent.className = 'p-6 h-full';
        
        if (pageIndex === 0) {
          // First page: Title, client info, negotiation details, payment options
          pageContent.innerHTML = `
            <!-- Header with logo -->
            <div class="bg-gradient-to-r from-af-blue-600 to-af-blue-800 text-white p-4 rounded-md mb-6">
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                  <img src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" alt="Logo" class="h-14 w-auto">
                  <h1 class="text-2xl font-bold">Proposta de Parcelamento PGFN</h1>
                </div>
                <div class="bg-af-green-500 text-white text-sm py-1.5 px-3 rounded-md">
                  Economia de R$ ${calculateEconomyValue(data.totalDebt, data.discountedValue)}
                </div>
              </div>
            </div>
            
            <!-- Client Info -->
            <div class="mb-6">
              <h2 class="text-lg font-semibold mb-2 text-af-blue-800 border-b pb-1">Dados do Contribuinte</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">CNPJ:</p>
                  <p>${data.cnpj || ''}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Razão Social:</p>
                  <p>${data.clientName || ''}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Situação:</p>
                  <p>${data.situation || ''}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Data de Abertura:</p>
                  <p>${data.openingDate || ''}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-sm text-gray-500">Endereço:</p>
                  <p>${data.address || ''}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Telefone:</p>
                  <p>${data.clientPhone || ''}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Email:</p>
                  <p>${data.clientEmail || ''}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-sm text-gray-500">Atividade Principal:</p>
                  <p>${data.businessActivity || ''}</p>
                </div>
              </div>
            </div>
            
            <!-- Negotiation Details -->
            <div class="mb-6">
              <h2 class="text-lg font-semibold mb-2 text-af-blue-800 border-b pb-1">Dados da Negociação</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Valor Consolidado:</p>
                  <p>R$ ${data.totalDebt || '0,00'}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Valor com Reduções:</p>
                  <p class="text-green-600">R$ ${data.discountedValue || '0,00'}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-sm text-gray-500">Percentual de Desconto:</p>
                  <p class="text-green-600">${calculateDiscountPercentage(data.totalDebt, data.discountedValue)}%</p>
                </div>
              </div>
            </div>
            
            <!-- Payment Options -->
            <div class="mb-6">
              <h2 class="text-lg font-semibold mb-2 text-af-blue-800 border-b pb-1">Opções de Pagamento</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">À Vista:</p>
                  <p>R$ ${data.discountedValue || '0,00'}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Parcelado:</p>
                  <p>${data.installments || '0'}x de R$ ${data.installmentValue || '0,00'}</p>
                </div>
              </div>
            </div>
            
            <!-- Fees -->
            <div class="mb-6">
              <h2 class="text-lg font-semibold mb-2 text-af-blue-800 border-b pb-1">Honorários</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Honorários à Vista:</p>
                  <p>R$ ${data.feesValue || '0,00'}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Honorários Parcelados:</p>
                  <p>${data.feesInstallments || '0'}x de R$ ${data.feesInstallmentValue || '0,00'} no cartão</p>
                </div>
                <div class="col-span-2">
                  <p class="text-sm text-gray-500">Total:</p>
                  <p>R$ ${calculateTotal(data.feesValue, data.feesInstallments, data.feesInstallmentValue)}</p>
                </div>
              </div>
            </div>
            
            <!-- Signature -->
            <div class="mt-12 border-t pt-6">
              <p class="text-center">${data.sellerName || 'Especialista Tributário'}</p>
              <p class="text-center text-gray-500">Especialista Tributário</p>
              <p class="text-center text-gray-500 text-sm mt-1">${data.sellerEmail || ''}</p>
            </div>
            
            <!-- Page number -->
            <div class="absolute bottom-4 right-6 text-xs text-gray-500">
              Página 1 de ${numberOfPages}
            </div>
          `;
        } else {
          // Payment schedule page
          pageContent.innerHTML = await generatePaymentScheduleHtml(data);
          
          // Add page number
          const pageNumberDiv = document.createElement('div');
          pageNumberDiv.className = 'absolute bottom-4 right-6 text-xs text-gray-500';
          pageNumberDiv.textContent = `Página ${pageIndex + 1} de ${numberOfPages}`;
          pageContent.appendChild(pageNumberDiv);
        }
        
        // Replace content
        contentContainer.innerHTML = '';
        contentContainer.appendChild(pageContent);
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
      document.body.removeChild(tempDiv);
    }

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

// Helper function to generate payment schedule HTML
async function generatePaymentScheduleHtml(data: Partial<ExtractedData>): Promise<string> {
  try {
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
    
    let html = `
      <div class="border-b border-gray-200 pb-4 mb-6">
        <h2 class="text-xl font-semibold text-center text-blue-800">
          Cronograma de Pagamento
        </h2>
      </div>
    `;
    
    // Entry payments
    if (entryDates.length > 0) {
      html += `
        <div class="border-l-4 border-blue-500 pl-4 py-2 mb-6">
          <h4 class="text-sm font-medium text-blue-700 mb-2">
            Entrada:
          </h4>
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
      `;
      
      entryDates.forEach((item, index) => {
        html += `
          <tr class="${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}">
            <td class="pr-4 py-1">${item.installment}ª</td>
            <td class="pr-4 py-1">${item.formattedDate}</td>
            <td class="text-right py-1">R$ ${data.entryValue}</td>
          </tr>
        `;
      });
      
      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    
    // Regular installments
    if (installmentDates.length > 0) {
      html += `
        <div class="border-l-4 border-green-500 pl-4 py-2">
          <h4 class="text-sm font-medium text-green-700 mb-2">
            ${entryDates.length > 0 
              ? "Após o pagamento da entrada você pagará o restante em " + installmentDates.length + " parcelas:"
              : "Parcelas:"}
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
      `;
      
      installmentDates.forEach((item, index) => {
        html += `
          <tr class="${index % 2 === 0 ? 'bg-green-50' : 'bg-white'}">
            <td class="pr-4 py-1">${entryDates.length + item.installment}ª</td>
            <td class="pr-4 py-1">${item.formattedDate}</td>
            <td class="text-right py-1">R$ ${data.installmentValue}</td>
          </tr>
        `;
      });
      
      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    
    return html;
  } catch (error) {
    console.error('Error generating payment schedule HTML:', error);
    return '';
  }
}

// Helper functions for calculations
function calculateEconomyValue(totalDebt?: string, discountedValue?: string): string {
  if (!totalDebt || !discountedValue) return '0,00';
  
  try {
    const totalDebtValue = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
    const discountedVal = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(totalDebtValue) || isNaN(discountedVal)) return '0,00';
    
    const economyValue = totalDebtValue - discountedVal;
    return economyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch (e) {
    console.error('Error calculating economy value:', e);
    return '0,00';
  }
}

function calculateDiscountPercentage(totalDebt?: string, discountedValue?: string): string {
  if (!totalDebt || !discountedValue) return '0,00';
  
  try {
    const totalDebtValue = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
    const discountedVal = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(totalDebtValue) || isNaN(discountedVal) || totalDebtValue === 0) return '0,00';
    
    const percentage = ((totalDebtValue - discountedVal) / totalDebtValue) * 100;
    return percentage.toFixed(2).replace('.', ',');
  } catch (e) {
    console.error('Error calculating discount percentage:', e);
    return '0,00';
  }
}

function calculateTotal(feesValue?: string, feesInstallments?: string, feesInstallmentValue?: string): string {
  try {
    // Try to calculate from installments if available
    if (feesInstallments && feesInstallmentValue) {
      const installments = parseInt(feesInstallments);
      const installmentValue = parseFloat(feesInstallmentValue.replace(/\./g, '').replace(',', '.'));
      
      if (!isNaN(installments) && !isNaN(installmentValue)) {
        const total = installments * installmentValue;
        return total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }
    
    // Fallback to fees value if installments calculation failed
    if (feesValue) {
      const value = parseFloat(feesValue.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(value)) {
        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
    }
    
    return '0,00';
  } catch (e) {
    console.error('Error calculating total:', e);
    return '0,00';
  }
}
