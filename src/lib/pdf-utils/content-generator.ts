
import { ExtractedData } from './types';
import { calculateEconomyValue, calculateDiscountPercentage, hasDates } from './helpers';

// Helper function to generate main page content
export function generateMainPageContent(data: Partial<ExtractedData>): string {
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

// Helper function to generate payment schedule HTML
export function generatePaymentSchedulePage(data: Partial<ExtractedData>, totalPages: number): string {
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
