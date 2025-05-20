
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { SectionContainer, DataField } from './index';

interface PaymentSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
  };
  compact?: boolean;
}

const PaymentSection = ({ data, colors, compact = false }: PaymentSectionProps) => {
  // Calculate entry installment value
  const entryInstallmentValue = () => {
    if (data.entryValue && data.entryInstallments) {
      try {
        // Convert currency string to number, replace ',' with '.' and remove '.'
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
    return "0,00";
  };

  return (
    <SectionContainer 
      title="Opções de Pagamento" 
      color={colors.secondary}
      compact={compact}
    >
      <DataField 
        label="À Vista" 
        value={`R$ ${data.discountedValue || '0,00'}`}
        className="border border-gray-100"
        compact={compact}
      />
      
      <DataField 
        label="Parcelado" 
        value={
          <>
            <p>{data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</p>
            {parseInt(data.entryInstallments || '1') > 1 ? (
              <p className={compact ? "text-xs text-gray-500 mt-1" : "text-sm text-gray-500 mt-1"}>
                Entrada: {data.entryInstallments}x de R$ {entryInstallmentValue()}
              </p>
            ) : (
              <p className={compact ? "text-xs text-gray-500 mt-1" : "text-sm text-gray-500 mt-1"}>
                Entrada de R$ {data.entryValue || '0,00'}
              </p>
            )}
          </>
        }
        className="border border-gray-100"
        compact={compact}
      />
    </SectionContainer>
  );
};

export default PaymentSection;
