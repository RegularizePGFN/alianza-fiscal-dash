
import React from 'react';
import { CreditCard } from 'lucide-react';
import { calculateEconomy } from "@/lib/pdf/utils";
import { getLastBusinessDayOfMonth, formatDateBR } from '@/hooks/proposals/useDatesHandling';

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

  const economyValue = calculateEconomy(totalDebt, discountedValue);
  
  // Get the last business day of current month for payment deadline
  const currentDate = new Date();
  const lastBusinessDay = getLastBusinessDayOfMonth(currentDate);
  const formattedLastBusinessDay = formatDateBR(lastBusinessDay);

  return (
    <div className="bg-white p-0">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-semibold text-af-blue-800 mb-1 flex items-center">
          <CreditCard className="mr-1 h-2.5 w-2.5 flex-shrink-0 text-af-blue-600" />
          Opções de Pagamento
        </h3>
        
        {hasDiscount() && (
          <div className="text-[9px] font-medium text-af-green-700 whitespace-nowrap">
            Economia de R$ {economyValue}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-5 gap-1">
        {/* À Vista card - now smaller (1/5 of the grid) */}
        <div className="col-span-1 border border-af-blue-100 rounded p-1 hover:bg-af-blue-50 transition-colors shadow-sm">
          <p className="font-medium text-af-blue-700 text-[10px]">À Vista</p>
          <p className="text-[11px] font-bold">R$ {discountedValue || '0,00'}</p>
        </div>
        
        {/* Parcelado card - now larger (4/5 of the grid) */}
        <div className="col-span-4 border border-af-blue-100 rounded p-1 hover:bg-af-blue-50 transition-colors shadow-sm">
          <p className="font-medium text-af-blue-700 text-[10px] mb-0.5">Parcelado</p>
          
          <div className="grid grid-cols-2 gap-1">
            {/* Entry payment section - now on the left */}
            <div className="border-r border-af-blue-50 pr-1">
              <p className="text-[9px] text-af-blue-700 font-medium">
                Entrada: {parseInt(entryInstallments || '1') > 1 ? 
                  `${entryInstallments}x de R$ ${entryInstallmentValue()}` : 
                  `R$ ${entryValue || '0,00'}`}
              </p>
            </div>
            
            {/* Remaining installments - now on the right */}
            {parseInt(installments || '0') > 0 && (
              <div className="pl-1">
                <p className="text-[9px] text-af-blue-700 font-medium">
                  Parcelas Restantes: {installments}x de R$ {installmentValue || '0,00'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment deadline information */}
      <div className="mt-1 pt-1 border-t border-af-blue-100 text-[8px] text-af-blue-700">
        <p>Pagamento da 1ª parcela: <strong>{formattedLastBusinessDay}</strong> até 20h.</p>
        <p>Demais parcelas: último dia útil de cada mês.</p>
      </div>
    </div>
  );
};

export default PaymentOptionsSection;
