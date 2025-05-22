
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { formatBrazilianCurrency } from "@/lib/utils";

interface NegotiationDataSectionProps {
  data: Partial<ExtractedData>;
}

const NegotiationDataSection = ({ data }: NegotiationDataSectionProps) => {
  const calculateDiscountPercentage = (): string => {
    if (!data.totalDebt || !data.discountedValue) return '0,00';
    
    try {
      const totalDebtValue = parseFloat(data.totalDebt.replace(/\./g, '').replace(',', '.'));
      const discountedValue = parseFloat(data.discountedValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(totalDebtValue) || isNaN(discountedValue) || totalDebtValue === 0) {
        return '0,00';
      }
      
      const percentualDiscount = ((totalDebtValue - discountedValue) / totalDebtValue) * 100;
      return percentualDiscount.toFixed(2).replace('.', ',');
    } catch (e) {
      console.error('Error calculating discount percentage:', e);
      return '0,00';
    }
  };

  return (
    <div className="mb-3">
      <h2 className="text-xs font-semibold mb-2 text-gray-800 border-b pb-1">
        Dados da Negociação
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <p className="text-[10px] text-gray-600">Valor Consolidado:</p>
          <p>R$ {data.totalDebt || '0,00'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600">Valor com Reduções:</p>
          <p className="text-green-600">R$ {data.discountedValue || '0,00'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] text-gray-600">Percentual de Desconto:</p>
          <p className="text-green-600">{calculateDiscountPercentage()}%</p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationDataSection;
