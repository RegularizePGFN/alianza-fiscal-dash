
import html2canvas from 'html2canvas';
import { ExtractedData, CompanyData } from '../types/proposals';
import { formatAddress, formatDateString, formatCurrency, calculateEconomy } from './utils';

// Function to generate a simplified PNG with company data
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
    
    // Render the HTML content
    tempDiv.innerHTML = `
      <div class="bg-af-blue-700 text-white p-4 flex justify-between items-center rounded-t-lg">
        <div class="flex gap-3 items-center">
          <img src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" class="h-10 w-auto" alt="Logo" />
          <h2 class="text-xl font-bold">Proposta de Parcelamento PGFN</h2>
        </div>
        <div class="text-af-green-400">
          Economia de R$ ${calculateEconomy(data.totalDebt, data.discountedValue)}
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
              <p>${formatDateString(companyData.founded)}</p>
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
        ${data.showFeesInstallments === 'true' && data.feesInstallmentValue ? `
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-purple-50 p-4 rounded-md border border-purple-100">
              <div>
                <span class="font-medium text-purple-800">Honorários à Vista:</span>
                <p class="text-sm text-gray-600">Pagamento imediato</p>
              </div>
              <div class="text-xl font-bold text-purple-700 mt-1">
                ${formatCurrency(data.feesValue)}
              </div>
            </div>
            <div class="bg-purple-50 p-4 rounded-md border border-purple-100">
              <div>
                <span class="font-medium text-purple-800">Honorários Parcelados:</span>
                <p class="text-sm text-gray-600">Pagamento imediato da parcela</p>
              </div>
              <div class="text-xl font-bold text-purple-700 mt-1">
                ${data.feesInstallments}x de ${formatCurrency(data.feesInstallmentValue)}
              </div>
              <div class="text-xs text-purple-700">
                Total: ${formatCurrency(data.feesTotalInstallmentValue)}
              </div>
            </div>
          </div>
        ` : `
          <div class="bg-purple-50 p-4 rounded-md border border-purple-100 flex justify-between items-center">
            <div>
              <span class="font-medium text-purple-800">Honorários à Vista:</span>
              <p class="text-sm text-gray-600">Pagamento imediato</p>
            </div>
            <div class="text-xl font-bold text-purple-700">
              ${formatCurrency(data.feesValue)}
            </div>
          </div>
        `}
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
      .text-af-green-400 { color: #34d399; }
      .text-af-green-700 { color: #047857; }
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
