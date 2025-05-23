
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
          <div className="text-xs text-af-green-700 whitespace-nowrap">
            Economia de R$ {economyValue}
          </div>
        )
      }
      fullWidth={true}
    >
      <DataField 
        label="À Vista" 
        value={`R$ ${data.discountedValue || '0,00'}`}
      />
      <div>
        <DataField 
          label="Parcelado" 
          value=""
        />
        
        {/* Entry payment section - now first */}
        {parseInt(data.entryInstallments || '1') >= 1 && (
          <div className="text-xs text-gray-600 ml-4 mb-2">
            <span className="font-medium">Entrada:</span> {parseInt(data.entryInstallments || '1') > 1 ? 
              `${data.entryInstallments}x de R$ ${entryInstallmentValue()}` : 
              `R$ ${data.entryValue || '0,00'}`}
          </div>
        )}

        {/* Remaining installments - now second */}
        {parseInt(data.installments || '0') > 0 && (
          <div className="text-xs text-gray-600 ml-4">
            <span className="font-medium">Parcelas Restantes:</span> {data.installments}x de R$ {data.installmentValue || '0,00'}
          </div>
        )}
      </div>
      
      {/* Payment deadline information */}
      <div className="mt-3 pt-2 border-t border-af-blue-100 text-xs text-gray-600">
        <p>O pagamento da 1ª parcela da ENTRADA é para o dia <strong>{formattedLastBusinessDay}</strong> até as 20h.</p>
        <p>Demais parcelas da negociação são para o último dia útil de cada mês.</p>
      </div>
    </SectionContainer>
  );
};

export default PaymentSection;
