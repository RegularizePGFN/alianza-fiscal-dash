
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface NegotiationDataSectionProps {
  data: Partial<ExtractedData>;
}

const NegotiationDataSection = ({ data }: NegotiationDataSectionProps) => {
  // Check if there's any discount or economy
  const hasDiscount = () => {
    if (!data.totalDebt || !data.discountedValue) return false;
    
    try {
      const totalDebt = parseFloat(data.totalDebt.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      const discountedValue = parseFloat(data.discountedValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      
      // If they're equal or the discount percentage is 0, there's no discount
      return totalDebt > discountedValue && (data.discountPercentage !== '0' && data.discountPercentage !== '0,00');
    } catch (error) {
      console.error("Error checking if has discount:", error);
      return false;
    }
  };

  // If there's no discount, don't render this section
  if (!hasDiscount()) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 mb-3 text-af-blue-800">
        Dados da Negociação
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700">
            Valor Consolidado:
          </span>
          <p className="text-lg">R$ {data.totalDebt || '-'}</p>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100 bg-gradient-to-br from-af-green-50 to-white">
          <span className="font-medium text-af-green-700">
            Valor com Reduções:
          </span>
          <p className="text-lg font-bold text-af-green-700">R$ {data.discountedValue || '-'}</p>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700">
            Percentual de Desconto:
          </span>
          <p className="text-lg">{data.discountPercentage || '-'}%</p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationDataSection;
