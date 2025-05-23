
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
    <div className="bg-white p-1.5 rounded-lg border border-af-blue-200 shadow-sm">
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
      
      <div className="grid grid-cols-2 gap-1">
        <div className="border border-af-blue-100 rounded p-1 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-[10px]">À Vista</p>
          <p className="text-[11px] font-bold">R$ {discountedValue || '0,00'}</p>
        </div>
        <div className="border border-af-blue-100 rounded p-1 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-[10px]">Parcelado</p>
          
          {/* Entry payment section - now first */}
          {parseInt(entryInstallments || '1') >= 1 && (
            <div className="mb-0.5">
              <p className="text-[9px] text-af-blue-700 font-medium">
                Entrada: {parseInt(entryInstallments || '1') > 1 ? 
                  `${entryInstallments}x de R$ ${entryInstallmentValue()}` : 
                  `R$ ${entryValue || '0,00'}`}
              </p>
            </div>
          )}
          
          {/* Remaining installments - now second */}
          {parseInt(installments || '0') > 0 && (
            <div className="mt-0.5 border-t border-af-blue-50 pt-0.5">
              <p className="text-[9px] text-af-blue-700 font-medium">
                Parcelas Restantes: {installments}x de R$ {installmentValue || '0,00'}
              </p>
            </div>
          )}
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
