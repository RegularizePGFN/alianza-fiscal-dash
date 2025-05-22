
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
    
    // Determine total pages
    let totalPages = 1; // Start with 1 page
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
    const pages = [];
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      // Find page navigation elements
      const pageNav = proposalElement.querySelector('.pagination-content');
      if (pageNav) {
        // Simulate clicking on the correct page button
        const pageButtons = pageNav.querySelectorAll('[data-page]');
        const targetButton = Array.from(pageButtons).find(btn => 
          btn.getAttribute('data-page') === pageIndex.toString()
        );
        
        if (targetButton instanceof HTMLElement) {
          targetButton.click();
        }
      } else {
        // Set the current page in the DOM if no navigation buttons
        const contentDiv = proposalElement.querySelector('[data-page]');
        if (contentDiv) {
          contentDiv.setAttribute('data-page', pageIndex.toString());
        }
      }
        
      // Force a re-render
      await new Promise(resolve => setTimeout(resolve, 200));
      
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
          const actionButtons = documentClone.querySelectorAll('[data-pdf-remove="true"]');
          actionButtons.forEach(button => {
            if (button instanceof HTMLElement) {
              button.style.display = 'none';
            }
          });
        }
      });
      
      pages.push(canvas);
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
      subject: 'Proposta de Transação Tributária | PGFN',
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

    // Hide elements that shouldn't appear in the export
    const elementsToHide = proposalElement.querySelectorAll('[data-pdf-remove="true"]');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });

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
      const elementsToHideInClone = cloneElement.querySelectorAll('[data-pdf-remove="true"]');
      elementsToHideInClone.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none';
        }
      });
      
      // Set the correct page in the content
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
      document.body.removeChild(tempDiv);
    }

    // Restore visibility of hidden elements
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = '';
      }
    });

    // Save the PDF
    pdf.save(fileName);
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}

// Helper function to generate main page content
function generateMainPageContent(data: Partial<ExtractedData>): string {
  return `
  <div class="p-3 space-y-2 h-full">
    <!-- Header with logo -->
    <div class="py-2 border-b border-gray-200 mb-2">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <img src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" alt="Logo" class="h-5 w-auto">
          <h1 class="text-sm font-semibold text-gray-800">Proposta de Transação Tributária | PGFN</h1>
        </div>
        <div class="text-xs text-gray-700">
          • Economia de R$ ${calculateEconomyValue(data.totalDebt, data.discountedValue)}
        </div>
      </div>
    </div>
    
    <!-- Client Info -->
    <div class="mb-3">
      <h2 class="text-xs font-semibold mb-1.5 text-gray-800 border-b pb-0.5">Dados do Contribuinte</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
        <div>
          <p class="text-[10px] text-gray-500">CNPJ:</p>
          <p>${data.cnpj || ''}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500">Razão Social:</p>
          <p>${data.clientName || ''}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500">Situação:</p>
          <p>${data.situation || ''}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500">Data de Abertura:</p>
          <p>${data.openingDate || ''}</p>
        </div>
        <div class="col-span-2">
          <p class="text-[10px] text-gray-500">Endereço:</p>
          <p>${data.address || ''}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500">Telefone:</p>
          <p>${data.clientPhone || ''}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500">Email:</p>
          <p>${data.clientEmail || ''}</p>
        </div>
        <div class="col-span-2">
          <p class="text-[10px] text-gray-500">Atividade Principal:</p>
          <p>${data.businessActivity || ''}</p>
        </div>
      </div>
    </div>
    
    <!-- Negotiation Details -->
    <div class="mb-3">
      <h2 class="text-xs font-semibold mb-1.5 text-gray-800 border-b pb-0.5">Dados da Negociação</h2>
      <div class="grid grid-cols-2 gap-1.5 text-xs">
        <div>
          <p class="text-[10px] text-gray-500">Valor Consolidado:</p>
          <p>R$ ${data.totalDebt || '0,00'}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500">Valor com Reduções:</p>
          <p class="text-green-600">R$ ${data.discountedValue || '0,00'}</p>
        </div>
        <div class="col-span-2">
          <p class="text-[10px] text-gray-500">Percentual de Desconto:</p>
          <p class="text-green-600">${calculateDiscountPercentage(data.totalDebt, data.discountedValue)}%</p>
        </div>
      </div>
    </div>
    
    <!-- Payment Options -->
    <div class="mb-3">
      <h2 class="text-xs font-semibold mb-1.5 text-gray-800 border-b pb-0.5">Opções de Pagamento</h2>
      <div class="grid grid-cols-2 gap-1.5 text-xs">
        <div>
          <p class="text-[10px] text-gray-500">À Vista:</p>
          <p>R$ ${data.discountedValue || '0,00'}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500">Parcelado:</p>
          <p>${data.installments || '0'}x de R$ ${data.installmentValue || '0,00'}</p>
        </div>
      </div>
    </div>
    
    <!-- Fees -->
    <div class="mb-3">
      <h2 class="text-xs font-semibold mb-1.5 text-gray-800 border-b pb-0.5">Honorários</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-xs">
        <div>
          <p class="text-[10px] text-gray-500">Honorários à Vista:</p>
          <p>R$ ${data.feesValue || '0,00'}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500">Honorários Parcelados:</p>
          <p>${data.feesInstallments || '0'}x de R$ ${data.feesInstallmentValue || '0,00'} no cartão</p>
        </div>
      </div>
    </div>
    
    <!-- Additional Comments -->
    ${data.additionalComments ? `
    <div class="mb-3">
      <h2 class="text-xs font-semibold mb-1.5 text-gray-800 border-b pb-0.5">Observações</h2>
      <div class="text-xs">
        <p>${data.additionalComments}</p>
      </div>
    </div>
    ` : ''}
    
    <!-- Signature -->
    <div class="mt-4 border-t pt-2">
      <p class="text-center text-xs">${data.sellerName || 'Especialista Tributário'}</p>
      <p class="text-center text-[10px] text-gray-500">Especialista Tributário</p>
      <p class="text-center text-[10px] text-gray-500 mt-0.5">${data.sellerEmail || ''}</p>
    </div>
    
    <!-- Page number -->
    <div class="absolute bottom-2 right-4 text-[10px] text-gray-500">
      Página 1 de ${hasDates(data) ? '2' : '1'}
    </div>
  </div>
  `;
}

// Helper function to determine if we have payment dates
function hasDates(data: Partial<ExtractedData>): boolean {
  try {
    const entryDates = data.entryDates ? JSON.parse(data.entryDates) : [];
    const installmentDates = data.installmentDates ? JSON.parse(data.installmentDates) : [];
    return entryDates.length > 0 || installmentDates.length > 0;
  } catch (error) {
    return false;
  }
}

// Helper function to generate payment schedule HTML
function generatePaymentSchedulePage(data: Partial<ExtractedData>, totalPages: number): string {
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
      <div class="p-3 space-y-2 h-full">
        <div class="border-b border-gray-200 pb-2 mb-2">
          <h2 class="text-sm font-semibold text-center text-gray-800">
            Cronograma de Pagamento
          </h2>
        </div>
    `;
    
    // Entry payments
    if (entryDates.length > 0) {
      html += `
        <div class="border-l-2 border-blue-300 pl-2 py-1 mb-2">
          <h4 class="text-xs font-medium text-gray-700 mb-1">
            Entrada:
          </h4>
          <div class="bg-white p-2 rounded-md border border-gray-200 overflow-x-auto">
            <table class="w-full text-[10px]">
              <thead class="text-[10px] text-gray-500">
                <tr>
                  <th class="text-left pr-4 py-0.5">Parcela</th>
                  <th class="text-left pr-4 py-0.5">Vencimento</th>
                  <th class="text-right py-0.5">Valor</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      entryDates.forEach((item, index) => {
        html += `
          <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
            <td class="pr-4 py-0.5">${item.installment}ª</td>
            <td class="pr-4 py-0.5">${item.formattedDate}</td>
            <td class="text-right py-0.5">R$ ${data.entryValue}</td>
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
        <div class="border-l-2 border-green-300 pl-2 py-1">
          <h4 class="text-xs font-medium text-gray-700 mb-1">
            ${entryDates.length > 0 
              ? "Após o pagamento da entrada você pagará o restante em " + installmentDates.length + " parcelas:"
              : "Parcelas:"}
          </h4>
          <div class="bg-white p-2 rounded-md border border-gray-200 overflow-x-auto">
            <table class="w-full text-[10px]">
              <thead class="text-[10px] text-gray-500">
                <tr>
                  <th class="text-left pr-4 py-0.5">Parcela</th>
                  <th class="text-left pr-4 py-0.5">Vencimento</th>
                  <th class="text-right py-0.5">Valor</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      installmentDates.forEach((item, index) => {
        html += `
          <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
            <td class="pr-4 py-0.5">${entryDates.length + item.installment}ª</td>
            <td class="pr-4 py-0.5">${item.formattedDate}</td>
            <td class="text-right py-0.5">R$ ${data.installmentValue}</td>
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
    
    html += `
      <!-- Page number -->
      <div class="absolute bottom-2 right-4 text-[10px] text-gray-500">
        Página 2 de ${totalPages}
      </div>
    </div>
    `;
    
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
