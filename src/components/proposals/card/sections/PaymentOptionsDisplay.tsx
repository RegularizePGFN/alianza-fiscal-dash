
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { calculateEconomy } from "@/lib/pdf/utils";
import { getLastBusinessDayOfMonth, formatDateBR } from '@/hooks/proposals/useDatesHandling';

interface PaymentOptionsDisplayProps {
  data: Partial<ExtractedData>;
}

const PaymentOptionsDisplay = ({ data }: PaymentOptionsDisplayProps) => {
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

  const entryDisplay = parseInt(data.entryInstallments || '1') > 1 
    ? `${data.entryInstallments}x de R$ ${entryInstallmentValue()}`
    : `R$ ${data.entryValue || '0,00'}`;

  const economyValue = calculateEconomy(data.totalDebt, data.discountedValue);
  
  // Get the last business day of current month for payment deadline
  const currentDate = new Date();
  const lastBusinessDay = getLastBusinessDayOfMonth(currentDate);
  const formattedLastBusinessDay = formatDateBR(lastBusinessDay);

  return (
    <div className="bg-white p-5 rounded-lg border border-af-blue-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-af-blue-800">
          Opções de Pagamento
        </h3>
        
        {hasDiscount() && (
          <div className="text-sm font-medium text-af-green-700">
            Economia de R$ {economyValue}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-af-blue-100 rounded p-4 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700">À Vista</p>
          <p className="text-lg font-bold">R$ {data.discountedValue || '0,00'}</p>
        </div>
        <div className="border border-af-blue-100 rounded p-4 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700">Parcelado</p>
          <p className="text-lg font-bold">{data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</p>
          {parseInt(data.entryInstallments || '1') >= 1 && (
            <div className="mt-1">
              <p className="text-sm text-gray-500 leading-tight">
                Entrada em {entryDisplay}
                {parseInt(data.installments || '0') > 0 && (
                  <><br />Mais → {data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment deadline information */}
      <div className="mt-4 pt-3 border-t border-af-blue-100 text-sm text-af-blue-700">
        <p>O pagamento da 1ª parcela da ENTRADA é para o dia <strong>{formattedLastBusinessDay}</strong> até as 20h.</p>
        <p>Demais parcelas da negociação são para o último dia útil de cada mês.</p>
      </div>
    </div>
  );
};

export default PaymentOptionsDisplay;
