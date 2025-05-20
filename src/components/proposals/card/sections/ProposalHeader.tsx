
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Percent } from "lucide-react";
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
    <CardHeader className="bg-gradient-to-r from-af-blue-600 to-af-blue-800 text-white pb-8">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
            alt="Logo" 
            className="h-14 w-auto"
          />
          <CardTitle className="text-2xl font-bold text-white">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Proposta de Parcelamento PGFN
            </div>
          </CardTitle>
        </div>
        <Badge className="bg-af-green-500 hover:bg-af-green-400 text-white text-sm py-1.5 px-3">
          <Percent className="mr-1 h-4 w-4" /> 
          Economia de R$ {economyValue}
        </Badge>
      </div>
    </CardHeader>
  );
};

export default ProposalHeader;
