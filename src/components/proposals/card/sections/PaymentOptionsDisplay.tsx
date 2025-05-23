import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { calculateEconomy } from "@/lib/pdf/utils";
import { getLastBusinessDayOfMonth, formatDateBR } from '@/hooks/proposals/useDatesHandling';
interface PaymentOptionsDisplayProps {
  data: Partial<ExtractedData>;
}
const PaymentOptionsDisplay = ({
  data
}: PaymentOptionsDisplayProps) => {
  // Calculate entry installment value if multiple installments
  const entryInstallmentValue = () => {
    if (data.entryValue && data.entryInstallments && parseInt(data.entryInstallments) > 1) {
      try {
        const entryValue = parseFloat(data.entryValue.replace(/\./g, '').replace(',', '.'));
        const installments = parseInt(data.entryInstallments);
        if (!isNaN(entryValue) && !isNaN(installments) && installments > 0) {
          const installmentValue = entryValue / installments;
          return installmentValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      } catch (error) {
        console.error("Error calculating entry installment value:", error);
      }
    }
    return data.entryValue || "0,00";
  };

  // Check if there's any discount (economy)
  const hasDiscount = () => {
    if (!data.totalDebt || !data.discountedValue) return false;
    try {
      const totalDebt = parseFloat(data.totalDebt.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      const discountedValue = parseFloat(data.discountedValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      return totalDebt > discountedValue;
    } catch (error) {
      console.error("Error checking if has discount:", error);
      return false;
    }
  };
  const economyValue = calculateEconomy(data.totalDebt, data.discountedValue);

  // Get the last business day of current month for payment deadline
  const currentDate = new Date();
  const lastBusinessDay = getLastBusinessDayOfMonth(currentDate);
  const formattedLastBusinessDay = formatDateBR(lastBusinessDay);
  return <div className="bg-white p-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-af-blue-800">
          Opções de Pagamento
        </h3>
        
        {hasDiscount() && <div className="text-sm font-medium text-af-green-700">
            Economia de R$ {economyValue}
          </div>}
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {/* À Vista card - now smaller (1/5 of the space) */}
        <div className="col-span-1 border border-af-blue-100 rounded p-3 hover:bg-af-blue-50 transition-colors shadow-sm">
          <p className="font-medium text-af-blue-700 text-sm">À Vista</p>
          <p className="text-base font-bold text-left my-[18px]">R$ {data.discountedValue || '0,00'}</p>
        </div>
        
        {/* Parcelado card - now larger (4/5 of the space) */}
        <div className="col-span-4 border border-af-blue-100 rounded p-3 hover:bg-af-blue-50 transition-colors shadow-sm">
          <p className="font-medium text-af-blue-700 mb-2">Parcelado</p>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Entry payment section - now on the left */}
            <div className="border-r border-af-blue-100 pr-2">
              <p className="font-medium text-af-blue-700 text-sm">Entrada:</p>
              <p className="text-sm text-gray-700 font-semibold py-[10px]">
                {parseInt(data.entryInstallments || '1') > 1 ? `${data.entryInstallments}x de R$ ${entryInstallmentValue()}` : `R$ ${data.entryValue || '0,00'}`}
              </p>
            </div>
            
            {/* Remaining installments - now on the right */}
            {parseInt(data.installments || '0') > 0 && <div className="pl-2">
                <p className="font-medium text-af-blue-700 text-sm">Parcelas Restantes:</p>
                <p className="text-sm text-gray-700 font-semibold py-[10px]">
                  {data.installments}x de R$ {data.installmentValue || '0,00'}
                </p>
              </div>}
          </div>
        </div>
      </div>

      {/* Payment deadline information */}
      <div className="mt-4 pt-3 border-t border-af-blue-100 text-sm text-af-blue-700">
        <p className="px-[5px]">O pagamento da 1ª parcela da ENTRADA é para o dia <strong>{formattedLastBusinessDay}</strong> até as 20h.</p>
        <p className="px-[5px]">Demais parcelas da negociação são para o último dia útil de cada mês.</p>
      </div>
    </div>;
};
export default PaymentOptionsDisplay;