
import React from 'react';
import { DollarSign, Percent, Calendar, CheckSquare } from 'lucide-react';

interface NegotiationSectionProps {
  totalDebt: string;
  discountedValue: string;
  discountPercentage: string;
  entryValue: string;
  entryInstallments: string;
  installments: string;
  installmentValue: string;
}

const NegotiationSection = ({ 
  totalDebt, 
  discountedValue, 
  discountPercentage, 
  entryValue,
  entryInstallments,
  installments, 
  installmentValue 
}: NegotiationSectionProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-af-blue-800 pb-1 flex items-center border-b border-af-blue-200">
        <CheckSquare className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
        Dados da Negociação
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2 rounded border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-xs">
            <DollarSign className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Valor Consolidado:
          </span>
          <p className="text-xs">R$ {totalDebt || '-'}</p>
        </div>
        <div className="bg-white p-2 rounded border border-af-blue-100 bg-gradient-to-br from-af-green-50 to-white">
          <span className="font-medium text-af-green-700 flex items-center text-xs">
            <DollarSign className="mr-1 h-3 w-3 flex-shrink-0 text-af-green-600" />
            Valor com Reduções:
          </span>
          <p className="text-xs font-bold text-af-green-700">R$ {discountedValue || '-'}</p>
        </div>
        <div className="bg-white p-2 rounded border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-xs">
            <Percent className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Percentual de Desconto:
          </span>
          <p className="text-xs">{discountPercentage || '-'}%</p>
        </div>
        <div className="bg-white p-2 rounded border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-xs">
            <Calendar className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Parcelas:
          </span>
          <p className="text-xs">{installments || '-'}x de R$ {installmentValue || '-'}</p>
        </div>
        <div className="bg-white p-2 rounded border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-xs">
            <DollarSign className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Valor da Entrada:
          </span>
          <p className="text-xs">R$ {entryValue || '-'}</p>
        </div>
        <div className="bg-white p-2 rounded border border-af-blue-100">
          <span className="font-medium text-af-blue-700 flex items-center text-xs">
            <Calendar className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
            Parcelas da Entrada:
          </span>
          <p className="text-xs">{entryInstallments || '1'}x de R$ {entryValue || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationSection;
