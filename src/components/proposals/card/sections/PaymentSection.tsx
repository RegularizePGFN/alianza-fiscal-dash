
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface PaymentSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
  };
}

const PaymentSection = ({ data, colors }: PaymentSectionProps) => {
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
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200"
          style={{ color: colors.secondary }}>
        Opções de Pagamento
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded border border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            À Vista
          </span>
          <p className="text-base mt-1 font-medium">R$ {data.discountedValue || '0,00'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded border border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            Parcelado
          </span>
          <p className="text-base mt-1 font-medium">
            {data.installments || '0'}x de R$ {data.installmentValue || '0,00'}
          </p>
          {parseInt(data.entryInstallments || '1') > 1 ? (
            <p className="text-sm text-gray-500 mt-1">Entrada: {data.entryInstallments}x de R$ {entryInstallmentValue()}</p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">Entrada de R$ {data.entryValue || '0,00'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
