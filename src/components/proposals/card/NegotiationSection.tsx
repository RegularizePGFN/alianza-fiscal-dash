
import React from 'react';
import { DollarSign, Percent, Calendar, CheckSquare } from 'lucide-react';

interface NegotiationSectionProps {
  totalDebt: string;
  discountedValue: string;
  discountPercentage: string;
  entryValue: string;
  installments: string;
  installmentValue: string;
}

const NegotiationSection = ({ 
  totalDebt, 
  discountedValue, 
  discountPercentage, 
  entryValue, 
  installments, 
  installmentValue 
}: NegotiationSectionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-base border-b border-af-blue-200 pb-1 text-af-blue-800 flex items-center">
        <CheckSquare className="mr-2 h-4 w-4 flex-shrink-0 text-af-blue-600" />
        Dados da Negociação
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-sm">
            <DollarSign className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Valor Consolidado:
          </span>
          <p className="text-base">R$ {totalDebt || '-'}</p>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100 bg-gradient-to-br from-af-green-50 to-white">
          <span className="font-medium text-af-green-700 flex items-center text-sm">
            <DollarSign className="mr-1 h-3 w-3 flex-shrink-0 text-af-green-600" />
            Valor com Reduções:
          </span>
          <p className="text-base font-bold text-af-green-700">R$ {discountedValue || '-'}</p>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-sm">
            <Percent className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Percentual de Desconto:
          </span>
          <p className="text-base">{discountPercentage || '-'}%</p>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-sm">
            <DollarSign className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Valor da Entrada:
          </span>
          <p className="text-base">R$ {entryValue || '-'}</p>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-sm">
            <Calendar className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Número de Parcelas:
          </span>
          <p className="text-base">{installments || '-'}</p>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-sm">
            <DollarSign className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Valor das Parcelas:
          </span>
          <p className="text-base">R$ {installmentValue || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationSection;
