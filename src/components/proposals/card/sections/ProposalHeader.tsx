import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBrazilianCurrency } from '@/lib/utils';
interface ProposalHeaderProps {
  totalDebt?: string;
  discountedValue: string;
}
const ProposalHeader = ({
  totalDebt,
  discountedValue
}: ProposalHeaderProps) => {
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
  return <CardHeader className="bg-gradient-to-r from-af-blue-600 to-af-blue-800 text-white pb-8">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" alt="Logo" className="h-10 w-auto" />
          <CardTitle className="font-bold text-white text-lg">Proposta de Regularização PGFN</CardTitle>
        </div>
        
      </div>
    </CardHeader>;
};
export default ProposalHeader;