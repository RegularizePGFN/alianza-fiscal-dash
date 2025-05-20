
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { formatBrazilianCurrency } from '@/lib/utils';

interface EconomyValueCalculatorProps {
  data: Partial<ExtractedData>;
  children: (economyValue: string) => React.ReactNode;
}

const EconomyValueCalculator = ({ data, children }: EconomyValueCalculatorProps) => {
  // Calculate the economy value
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
  
  return <>{children(economyValue)}</>;
};

export default EconomyValueCalculator;
