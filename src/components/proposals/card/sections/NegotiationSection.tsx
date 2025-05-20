
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { SectionContainer, DataField } from './index';

interface NegotiationSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
  };
  compact?: boolean;
}

const NegotiationSection = ({ data, colors, compact = false }: NegotiationSectionProps) => {
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
      title="Dados da Negociação" 
      color={colors.secondary}
      compact={compact}
    >
      <DataField 
        label="Valor Consolidado" 
        value={`R$ ${data.totalDebt || '-'}`}
        compact={compact}
      />
      
      <DataField 
        label="Valor com Reduções" 
        value={`R$ ${data.discountedValue || '-'}`}
        highlight={true}
        className="bg-green-50"
        compact={compact}
      />
      
      <DataField 
        label="Percentual de Desconto" 
        value={`${data.discountPercentage || '-'}%`}
        compact={compact}
      />
      
      <DataField 
        label={parseInt(data.entryInstallments || '1') > 1 ? 
          `Entrada (${data.entryInstallments}x)` : 
          'Valor da Entrada'}
        value={
          parseInt(data.entryInstallments || '1') > 1 ? (
            <>
              <p>R$ {entryInstallmentValue()} por parcela</p>
              <p className={compact ? "text-xs text-gray-500" : "text-sm text-gray-500"}>
                Total: R$ {data.entryValue || '0,00'}
              </p>
            </>
          ) : (
            `R$ ${data.entryValue || '-'}`
          )
        }
        compact={compact}
      />
    </SectionContainer>
  );
};

export default NegotiationSection;
