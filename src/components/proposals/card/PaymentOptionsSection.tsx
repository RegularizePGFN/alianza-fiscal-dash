
import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentOptionsSectionProps {
  discountedValue: string;
  installments: string;
  installmentValue: string;
  entryValue: string;
  entryInstallments: string;
  totalDebt?: string;
}

const PaymentOptionsSection = ({ 
  discountedValue, 
  installments, 
  installmentValue, 
  entryValue,
  entryInstallments,
  totalDebt
}: PaymentOptionsSectionProps) => {
  // Calculate entry installment value if multiple installments
  const entryInstallmentValue = () => {
    if (entryValue && entryInstallments && parseInt(entryInstallments) > 1) {
      try {
        const entryValueNum = parseFloat(entryValue.replace(/\./g, '').replace(',', '.'));
        const installmentsNum = parseInt(entryInstallments);
        
        if (!isNaN(entryValueNum) && !isNaN(installmentsNum) && installmentsNum > 0) {
          const installmentVal = entryValueNum / installmentsNum;
          return installmentVal.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      } catch (error) {
        console.error("Error calculating entry installment value:", error);
      }
    }
    return entryValue || "0,00";
  };

  // Calculate the economy (savings)
  const calculateSavings = () => {
    if (!totalDebt || !discountedValue) return "0,00";
    
    try {
      // Parse values, handling BR currency format
      const totalValue = parseFloat(totalDebt.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      const discountValue = parseFloat(discountedValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      
      if (isNaN(totalValue) || isNaN(discountValue)) return "0,00";
      
      const savings = totalValue - discountValue;
      // Format back to BR currency
      return savings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (error) {
      console.error("Error calculating savings:", error);
      return "0,00";
    }
  };

  // Check if there's any discount
  const hasDiscount = () => {
    if (!totalDebt || !discountedValue) return false;
    
    try {
      const totalDebtValue = parseFloat(totalDebt.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      const discountVal = parseFloat(discountedValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      
      return totalDebtValue > discountVal;
    } catch (error) {
      console.error("Error checking if has discount:", error);
      return false;
    }
  };

  const entryDisplayValue = parseInt(entryInstallments || '1') > 1 
    ? `${entryInstallments}x de R$ ${entryInstallmentValue()}`
    : `R$ ${entryValue || '0,00'}`;

  return (
    <div className="bg-white p-1.5 rounded-lg border border-af-blue-200 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-semibold text-af-blue-800 mb-1 flex items-center">
          <CreditCard className="mr-1 h-2.5 w-2.5 flex-shrink-0 text-af-blue-600" />
          Opções de Pagamento
        </h3>
        
        {hasDiscount() && (
          <div className="bg-af-green-600 px-1 py-0.5 rounded text-[9px] font-medium text-white">
            Economia de R$ {calculateSavings()}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-1">
        <div className="border border-af-blue-100 rounded p-1 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-[10px]">À Vista</p>
          <p className="text-[11px] font-bold">R$ {discountedValue || '0,00'}</p>
        </div>
        <div className="border border-af-blue-100 rounded p-1 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-[10px]">Parcelado</p>
          <p className="text-[11px] font-bold">{installments || '0'}x de R$ {installmentValue || '0,00'}</p>
          {parseInt(entryInstallments || '1') >= 1 && (
            <div>
              <p className="text-[9px] text-gray-500 leading-tight">
                Entrada em {entryDisplayValue}
                {parseInt(installments || '0') > 0 && (
                  <><br />Mais → {installments || '0'}x de R$ {installmentValue || '0,00'}</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsSection;
