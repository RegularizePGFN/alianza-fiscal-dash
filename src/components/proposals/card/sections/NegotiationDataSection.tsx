
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700">Valor Original:</span>
          <p className="text-lg">R$ {data.totalDebt || '0,00'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700">Valor com Desconto:</span>
          <p className="text-lg text-green-600">R$ {data.discountedValue || '0,00'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700">% de Desconto:</span>
          <p className="text-lg text-green-600">{data.discountPercentage || '0'}%</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700">Número do Débito:</span>
          <p className="text-lg">{data.debtNumber || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationDataSection;
