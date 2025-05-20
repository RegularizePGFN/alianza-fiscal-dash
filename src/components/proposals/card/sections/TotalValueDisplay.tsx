
import React from 'react';
import { ArrowRight, DollarSign } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { formatBrazilianCurrency } from '@/lib/utils';

interface TotalValueDisplayProps {
  data: Partial<ExtractedData>;
}

const TotalValueDisplay = ({ data }: TotalValueDisplayProps) => {
  // Calculate the actual economy value (savings)
  const calculateEconomyValue = (): string => {
    if (!data.totalDebt || !data.discountedValue) return '0,00';
    
    try {
      const totalDebtValue = parseFloat(data.totalDebt.replace(/\./g, '').replace(',', '.'));
      const discountedVal = parseFloat(data.discountedValue.replace(/\./g, '').replace(',', '.'));
      
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
    <div className="mt-8 bg-gradient-to-r from-af-blue-700 to-af-blue-800 p-6 rounded-lg text-white shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold mb-1 flex items-center">
            <DollarSign className="mr-1 h-5 w-5" />
            Valor Total:
          </h3>
          <p className="text-sm opacity-80">Incluindo todas as reduções aplicáveis</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">
            R$ {data.discountedValue || '0,00'}
          </p>
          <div className="flex items-center text-af-green-300 mt-1">
            <ArrowRight className="h-4 w-4 mr-1" />
            <span className="text-sm">Economia de R$ {economyValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalValueDisplay;
