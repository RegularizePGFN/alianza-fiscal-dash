
import React from 'react';
import { DollarSign, Percent, Calendar, CheckSquare } from 'lucide-react';

interface NegotiationSectionProps {
  totalDebt: string;
  discountedValue: string;
  discountPercentage: string;
  installments: string;
  installmentValue: string;
}

const NegotiationSection = ({ 
  totalDebt, 
  discountedValue, 
  discountPercentage, 
  installments, 
  installmentValue 
}: NegotiationSectionProps) => {
  // Check if there's any discount
  const hasDiscount = () => {
    if (!totalDebt || !discountedValue) return false;
    
    try {
      const totalDebtValue = parseFloat(totalDebt.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      const discountVal = parseFloat(discountedValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      
      return totalDebtValue > discountVal && (discountPercentage !== '0' && discountPercentage !== '0,00');
    } catch (error) {
      console.error("Error checking if has discount:", error);
      return false;
    }
  };

  if (!hasDiscount()) return null;

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-af-blue-800 pb-1 flex items-center border-b border-af-blue-200">
        <CheckSquare className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
        Dados da Negociação
      </h3>
      
      <div className="grid grid-cols-2 gap-1">
        <div className="bg-white p-1 rounded border border-af-blue-100 flex flex-col">
          <span className="text-[10px] font-medium text-af-blue-700 flex items-center">
            <DollarSign className="mr-0.5 h-2.5 w-2.5 flex-shrink-0 text-af-blue-600" />
            Valor Consolidado:
          </span>
          <p className="text-[11px]">R$ {totalDebt || '-'}</p>
        </div>
        <div className="bg-white p-1 rounded border border-af-blue-100 bg-gradient-to-br from-af-green-50 to-white flex flex-col">
          <span className="text-[10px] font-medium text-af-green-700 flex items-center">
            <DollarSign className="mr-0.5 h-2.5 w-2.5 flex-shrink-0 text-af-green-600" />
            Valor com Reduções:
          </span>
          <p className="text-[11px] font-bold text-af-green-700">R$ {discountedValue || '-'}</p>
        </div>
        <div className="bg-white p-1 rounded border border-af-blue-100 flex flex-col">
          <span className="text-[10px] font-medium text-af-blue-700 flex items-center">
            <Percent className="mr-0.5 h-2.5 w-2.5 flex-shrink-0 text-af-blue-600" />
            Desconto:
          </span>
          <p className="text-[11px]">{discountPercentage || '-'}%</p>
        </div>
        <div className="bg-white p-1 rounded border border-af-blue-100 flex flex-col">
          <span className="text-[10px] font-medium text-af-blue-700 flex items-center">
            <Calendar className="mr-0.5 h-2.5 w-2.5 flex-shrink-0 text-af-blue-600" />
            Parcelas:
          </span>
          <p className="text-[11px]">{installments || '-'}x de R$ {installmentValue || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default NegotiationSection;
