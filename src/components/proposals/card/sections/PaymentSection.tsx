
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

  return (
    <SectionContainer 
      title="Opções de Pagamento" 
      icon={<CreditCard className="h-4 w-4" />}
      color={sectionColor}
    >
      <DataField 
        label="À Vista" 
        value={`R$ ${data.discountedValue || '0,00'}`}
      />
      <DataField 
        label="Parcelado" 
        value={`${data.installments || '0'}x de R$ ${data.installmentValue || '0,00'}`}
      />
    </SectionContainer>
  );
};

export default PaymentSection;
