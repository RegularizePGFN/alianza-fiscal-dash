
import React from 'react';
import { CheckSquare, DollarSign, Percent, Calendar } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";

interface NegotiationDataSectionProps {
  data: Partial<ExtractedData>;
}

const NegotiationDataSection = ({ data }: NegotiationDataSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
        <CheckSquare className="mr-2 h-5 w-5 text-af-blue-600" />
        Dados da Negociação
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center">
            <DollarSign className="mr-1 h-4 w-4 text-af-blue-600" />
            Valor Consolidado:
          </span>
          <p className="text-lg">R$ {data.totalDebt || '-'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100 bg-gradient-to-br from-af-green-50 to-white">
          <span className="font-medium text-af-green-700 flex items-center">
            <DollarSign className="mr-1 h-4 w-4 text-af-green-600" />
            Valor com Reduções:
          </span>
          <p className="text-lg font-bold text-af-green-700">R$ {data.discountedValue || '-'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center">
            <Percent className="mr-1 h-4 w-4 text-af-blue-600" />
            Percentual de Desconto:
          </span>
          <p className="text-lg">{data.discountPercentage || '-'}%</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center">
            <DollarSign className="mr-1 h-4 w-4 text-af-blue-600" />
            Valor da Entrada:
          </span>
          <p className="text-lg">R$ {data.entryValue || '-'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center">
            <Calendar className="mr-1 h-4 w-4 text-af-blue-600" />
            Número de Parcelas:
          </span>
          <p className="text-lg">{data.installments || '-'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center">
            <DollarSign className="mr-1 h-4 w-4 text-af-blue-600" />
            Valor das Parcelas:
          </span>
          <p className="text-lg">R$ {data.installmentValue || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationDataSection;
