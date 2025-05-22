
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

// New function to generate a simplified PNG with company data
export async function generateSimplifiedProposalPng(
  data: Partial<ExtractedData>, 
  companyData?: CompanyData | null
): Promise<void> {
  try {
    // Create a temporary div to render our simplified proposal
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '1000px';
    tempDiv.className = 'proposal-simplified bg-white p-6 rounded-lg';
    document.body.appendChild(tempDiv);
    
    // Format address if company data exists
    const formatAddress = (address?: CompanyData['address']) => {
      if (!address) return "Não disponível";
      
      const parts = [
        address.street,
        address.number ? `Nº ${address.number}` : "",
        address.details || "",
        address.district ? `${address.district}` : "",
        address.city && address.state ? `${address.city}/${address.state}` : "",
        address.zip ? `CEP: ${address.zip}` : ""
      ];
      
      return parts.filter(part => part).join(", ");
    };
    
    // Format date helper
    const formatDate = (dateString?: string) => {
      if (!dateString) return "Não disponível";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
      } catch (e) {
        return "Data inválida";
      }
    };
    
    // Helper function to format Brazilian currency
    const formatCurrency = (value?: string) => {
      if (!value) return "R$ 0,00";
      if (value.includes("R$")) return value;
      return `R$ ${value}`;
    };
    
    // Calculate economy value
    const calculateEconomy = () => {
      if (!data.totalDebt || !data.discountedValue) return "R$ 0,00";
      
      try {
        const totalDebtValue = parseFloat(data.totalDebt.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
        const discountedValue = parseFloat(data.discountedValue.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
        
        if (isNaN(totalDebtValue) || isNaN(discountedValue)) return "R$ 0,00";
        
        const economy = totalDebtValue - discountedValue;
        return `R$ ${economy.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } catch (e) {
        console.error('Error calculating economy value:', e);
        return "R$ 0,00";
      }
    };
    
    // Render the HTML content
    tempDiv.innerHTML = `
      <div class="bg-af-blue-700 text-white p-4 flex justify-between items-center rounded-t-lg">
        <div class="flex gap-3 items-center">
          <img src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" class="h-10 w-auto" alt="Logo" />
          <h2 class="text-xl font-bold">Proposta de Parcelamento PGFN</h2>
        </div>
        <div class="bg-af-green-500 text-white px-3 py-1 rounded">
          Economia de ${calculateEconomy()}
        </div>
      </div>
      
      <div class="mt-4">
        <h3 class="text-af-blue-800 font-medium border-b pb-2 mb-3">Dados do Contribuinte</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">CNPJ:</span>
            <p>${data.cnpj || 'Não disponível'}</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">Número do Débito:</span>
            <p>${data.debtNumber || 'Não disponível'}</p>
          </div>
          ${companyData ? `
            <div class="bg-slate-50 p-3 rounded-md border border-slate-200 col-span-2">
              <span class="font-medium text-sm text-af-blue-700">Razão Social:</span>
              <p>${companyData.company?.name || 'Não disponível'}</p>
            </div>
            <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
              <span class="font-medium text-sm text-af-blue-700">Situação:</span>
              <p>${companyData.status?.text || 'Não disponível'}</p>
            </div>
            <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
              <span class="font-medium text-sm text-af-blue-700">Data de Abertura:</span>
              <p>${formatDate(companyData.founded)}</p>
            </div>
            <div class="bg-slate-50 p-3 rounded-md border border-slate-200 col-span-2">
              <span class="font-medium text-sm text-af-blue-700">Endereço:</span>
              <p>${formatAddress(companyData.address)}</p>
            </div>
            ${companyData.phones?.length ? `
              <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
                <span class="font-medium text-sm text-af-blue-700">Telefone:</span>
                <p>${companyData.phones[0].area}${companyData.phones[0].number}</p>
              </div>
            ` : ''}
            ${companyData.emails?.length ? `
              <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
                <span class="font-medium text-sm text-af-blue-700">Email:</span>
                <p>${companyData.emails[0].address}</p>
              </div>
            ` : ''}
            ${companyData.mainActivity ? `
              <div class="bg-slate-50 p-3 rounded-md border border-slate-200 col-span-2">
                <span class="font-medium text-sm text-af-blue-700">Atividade Principal:</span>
                <p>${companyData.mainActivity.id} | ${companyData.mainActivity.text}</p>
              </div>
            ` : ''}
          ` : ''}
        </div>
      </div>
      
      <div class="mt-6">
        <h3 class="text-af-blue-800 font-medium border-b pb-2 mb-3">Dados da Negociação</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">Valor Consolidado:</span>
            <p class="text-lg">${formatCurrency(data.totalDebt)}</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">Valor com Reduções:</span>
            <p class="text-lg text-af-green-700 font-medium">${formatCurrency(data.discountedValue)}</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">Percentual de Desconto:</span>
            <p>${data.discountPercentage || '0%'}</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">Valor da Entrada:</span>
            <p>${formatCurrency(data.entryValue)}</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">Número de Parcelas:</span>
            <p>${data.installments || '0'}</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">Valor das Parcelas:</span>
            <p>${formatCurrency(data.installmentValue)}</p>
          </div>
        </div>
      </div>
      
      <div class="mt-6">
        <h3 class="text-af-blue-800 font-medium border-b pb-2 mb-3">Custos e Honorários</h3>
        <div class="bg-purple-50 p-4 rounded-md border border-purple-100 flex justify-between items-center">
          <div>
            <span class="font-medium text-purple-800">Honorários Aliança Fiscal:</span>
            <p class="text-sm text-gray-600">Pagamento imediato</p>
          </div>
          <div class="text-xl font-bold text-purple-700">
            ${formatCurrency(data.feesValue)}
          </div>
        </div>
      </div>
      
      <div class="mt-6">
        <h3 class="text-af-blue-800 font-medium border-b pb-2 mb-3">Opções de Pagamento</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">À Vista</span>
            <p class="text-lg">${formatCurrency(data.discountedValue)}</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-md border border-slate-200">
            <span class="font-medium text-sm text-af-blue-700">Parcelado</span>
            <p class="text-lg">${data.installments}x de ${formatCurrency(data.installmentValue)}</p>
            <p class="text-xs text-gray-600">Entrada de ${formatCurrency(data.entryValue)}</p>
          </div>
        </div>
      </div>
    `;

    // Add some essential styles for proper rendering
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .proposal-simplified {
        font-family: 'Roboto', sans-serif;
        color: #333;
        background-color: white;
      }
      .bg-af-blue-700 { background-color: #1e40af; }
      .bg-af-blue-800 { color: #1e3a8a; }
      .bg-af-green-500 { background-color: #10b981; }
      .bg-af-green-700 { color: #047857; }
      .text-af-blue-700 { color: #1e40af; }
      .text-af-blue-800 { color: #1e3a8a; }
      .text-purple-700 { color: #7e22ce; }
      .text-purple-800 { color: #6b21a8; }
      .bg-purple-50 { background-color: #f5f3ff; }
      .border-purple-100 { border-color: #ede9fe; }
    `;
    tempDiv.appendChild(styleTag);
    
    // Wait a bit to ensure rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Capture as PNG
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });
    
    // Generate file name
    const seller = data.sellerName ? 
      data.sellerName.replace(/[^\w]/g, '_').toLowerCase() : 'vendedor';
    const fileName = `proposta_simplificada_${data.cnpj?.replace(/\D/g, '') || 'cliente'}_${seller}.png`;
    
    // Create download link
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating simplified PNG:', error);
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

    // Create a temporary clone of the proposal element for PDF generation
    const proposalClone = proposalElement.cloneNode(true) as HTMLElement;
    document.body.appendChild(proposalClone);
    proposalClone.style.position = 'absolute';
    proposalClone.style.left = '-9999px';
    proposalClone.style.width = '210mm'; // A4 width
    
    // Apply PDF-specific styling to the clone
    const pdfStyle = document.createElement('style');
    pdfStyle.textContent = `
      @page { margin: 10mm; }
      body { font-family: 'Roboto', Arial, sans-serif; }
      * { box-sizing: border-box; }
      p { margin: 0; padding: 0; }
      .page-break { page-break-after: always; }
      button, [data-pdf-remove="true"] { display: none !important; }
      table { width: 100%; border-collapse: collapse; page-break-inside: avoid; }
      tr { page-break-inside: avoid; }
      td, th { padding: 4px; }
      h3, h4 { margin-top: 8px; margin-bottom: 4px; }
      .section { page-break-inside: avoid; }
      
      /* Simple styling for cleaner PDF output */
      .card { border: 1px solid #e0e0e0; margin-bottom: 12px; }
      .card-content { padding: 8px; }
      
      /* Override any complex gradients or shadows */
      .shadow, .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
      .bg-gradient-to-br { background: white !important; }
    `;
    
    proposalClone.appendChild(pdfStyle);
    
    // Hide elements that shouldn't appear in the PDF
    const elementsToHide = proposalClone.querySelectorAll('button, [data-pdf-remove="true"]');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    // Wait for content to be properly styled
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Set PDF document properties
    pdf.setProperties({
      title: `Proposta PGFN - ${data.clientName || data.cnpj || 'Cliente'}`,
      subject: 'Proposta de Parcelamento PGFN',
      author: 'Aliança Fiscal',
      creator: 'Sistema de Propostas'
    });
    
    // Function to add content to PDF page by page
    const renderPDF = async () => {
      // A4 dimensions in pixels (assuming 96 DPI)
      const a4Width = 210; // mm
      const a4Height = 297; // mm
      const pdfWidth = a4Width - 20; // subtract margins
      const pdfHeight = a4Height - 20; // subtract margins
      
      // Use html2canvas to render the clone element
      const canvas = await html2canvas(proposalClone, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate how many pages we need
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfImgWidth = pdfWidth;
      const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;
      
      // Add the image to the PDF, splitting across multiple pages as needed
      let heightLeft = pdfImgHeight;
      let position = 0;
      let page = 1;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, 10, pdfImgWidth, pdfImgHeight, '', 'FAST');
      heightLeft -= pdfHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position += pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, -(position - 10), pdfImgWidth, pdfImgHeight, '', 'FAST');
        heightLeft -= pdfHeight;
        page++;
      }
      
      // Add page numbers
      const totalPages = page;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Página ${i} de ${totalPages}`, a4Width / 2, a4Height - 5, { align: 'center' });
      }
      
      // Clean up
      document.body.removeChild(proposalClone);
      
      // Save the PDF
      pdf.save(fileName);
    };
    
    await renderPDF();
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
}
