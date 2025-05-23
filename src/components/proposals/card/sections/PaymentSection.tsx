
import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import SectionContainer from './SectionContainer';
import DataField from './DataField';
import { CreditCard } from 'lucide-react';
import { calculateEconomy } from "@/lib/pdf/utils";
import { getLastBusinessDayOfMonth, formatDateBR } from '@/hooks/proposals/useDatesHandling';

interface PaymentSectionProps {
  data: Partial<ExtractedData>;
  colors?: any;
}

const PaymentSection = ({ data, colors }: PaymentSectionProps) => {
  // Default color if not provided
  const sectionColor = colors?.secondary || '#1E40AF';
  
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

  // Check if there's any discount
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

  return (
    <SectionContainer 
      title="Opções de Pagamento" 
      icon={<CreditCard className="h-4 w-4" />}
      color={sectionColor}
      className="print:break-inside-avoid"
      extraHeaderContent={
        hasDiscount() && (
          <div className="text-xs text-af-green-700 dark:text-af-green-400 whitespace-nowrap">
            Economia de R$ {economyValue}
          </div>
        )
      }
      fullWidth={true}
    >
      <div className="grid grid-cols-5 gap-2">
        {/* À Vista card - smaller */}
        <div className="col-span-1 border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800">
          <div className="font-medium text-sm dark:text-gray-200" style={{ color: sectionColor }}>À Vista</div>
          <div className="font-bold text-base dark:text-white">R$ {data.discountedValue || '0,00'}</div>
        </div>
        
        {/* Parcelado card - larger */}
        <div className="col-span-4 border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800">
          <div className="font-medium text-sm mb-1 dark:text-gray-200" style={{ color: sectionColor }}>Parcelado</div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Entry payment section - on the left */}
            <div className="border-r border-gray-100 dark:border-gray-700 pr-2">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                <span className="font-medium dark:text-gray-200">Entrada:</span> {parseInt(data.entryInstallments || '1') > 1 ? 
                  `${data.entryInstallments}x de R$ ${entryInstallmentValue()}` : 
                  `R$ ${data.entryValue || '0,00'}`}
              </div>
            </div>

            {/* Remaining installments - on the right */}
            {parseInt(data.installments || '0') > 0 && (
              <div className="pl-2">
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-medium dark:text-gray-200">Parcelas Restantes:</span> {data.installments}x de R$ {data.installmentValue || '0,00'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment deadline information */}
      <div className="mt-3 pt-2 border-t border-af-blue-100 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        <p>O pagamento da 1ª parcela da ENTRADA é para o dia <strong className="dark:text-gray-200">{formattedLastBusinessDay}</strong> até as 20h.</p>
        <p>Demais parcelas da negociação são para o último dia útil de cada mês.</p>
      </div>
    </SectionContainer>
  );
};

export default PaymentSection;
