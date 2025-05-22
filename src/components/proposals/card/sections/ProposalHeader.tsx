
import React from 'react';
import { CardHeader } from "@/components/ui/card";
import { formatBrazilianCurrency } from '@/lib/utils';

interface ProposalHeaderProps {
  totalDebt?: string;
  discountedValue: string;
}

const ProposalHeader = ({ totalDebt, discountedValue }: ProposalHeaderProps) => {
  // Calculate the actual economy value (savings)
  const calculateEconomyValue = (): string => {
    if (!totalDebt || !discountedValue) return '0,00';
    
    try {
      const totalDebtValue = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
      const discountedVal = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(totalDebtValue) || isNaN(discountedVal)) return '0,00';
      
      const economyValue = totalDebtValue - discountedVal;
      return formatBrazilianCurrency(economyValue);
    } catch (e) {
      console.error('Error calculating economy value:', e);
      return '0,00';
    }
  };
  
  const economyValue = calculateEconomyValue();

  return (
    <CardHeader className="py-2 px-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
            alt="Logo" 
            className="h-5 w-auto"
          />
          <h1 className="text-sm font-semibold text-gray-800">
            Proposta de Transação Tributária | PGFN
          </h1>
        </div>
        <div className="text-xs text-gray-700">
          • Economia de R$ {economyValue}
        </div>
      </div>
    </CardHeader>
  );
};

export default ProposalHeader;
