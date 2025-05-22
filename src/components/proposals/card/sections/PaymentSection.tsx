
import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import SectionContainer from './SectionContainer';
import DataField from './DataField';
import { CreditCard } from 'lucide-react';

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

  // Calculate the economy (savings)
  const calculateSavings = () => {
    if (!data.totalDebt || !data.discountedValue) return "0,00";
    
    try {
      // Parse values, handling BR currency format
      const totalValue = parseFloat(data.totalDebt.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      const discountValue = parseFloat(data.discountedValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      
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

  // Format entry display
  const entryDisplay = parseInt(data.entryInstallments || '1') > 1 
    ? `${data.entryInstallments}x de R$ ${entryInstallmentValue()}`
    : `R$ ${data.entryValue || '0,00'}`;

  return (
    <SectionContainer 
      title="Opções de Pagamento" 
      icon={<CreditCard className="h-4 w-4" />}
      color={sectionColor}
      className="print:break-inside-avoid"
      extraHeaderContent={
        hasDiscount() && (
          <div className="bg-green-600 text-white text-xs py-1 px-3 rounded-sm whitespace-nowrap">
            Economia de R$ {calculateSavings()}
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
          value={`${data.installments || '0'}x de R$ ${data.installmentValue || '0,00'}`}
        />
        {parseInt(data.entryInstallments || '1') >= 1 && (
          <div className="text-xs text-gray-500 -mt-1 ml-4">
            Entrada em {entryDisplay}
            {parseInt(data.installments || '0') > 0 && (
              <><br />Mais → {data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</>
            )}
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default PaymentSection;
