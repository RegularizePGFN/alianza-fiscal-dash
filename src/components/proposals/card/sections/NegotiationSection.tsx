import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
interface NegotiationSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
  };
}
const NegotiationSection = ({
  data,
  colors
}: NegotiationSectionProps) => {
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
  return <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" style={{
      color: colors.secondary
    }}>
        Dados da Negociação
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">
            Valor Consolidado:
          </span>
          <p className="text-base mt-1">R$ {data.totalDebt || '-'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded bg-green-50">
          <span className="text-sm font-medium text-green-700">
            Valor com Reduções:
          </span>
          <p className="text-base mt-1 font-medium text-green-700">R$ {data.discountedValue || '-'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">
            Percentual de Desconto:
          </span>
          <p className="text-base mt-1">{data.discountPercentage || '-'}%</p>
        </div>
        
      </div>
    </div>;
};
export default NegotiationSection;