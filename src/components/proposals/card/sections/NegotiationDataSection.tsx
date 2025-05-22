
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface NegotiationDataSectionProps {
  data: Partial<ExtractedData>;
}

const NegotiationDataSection = ({ data }: NegotiationDataSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800">
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
