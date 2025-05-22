
import React from 'react';
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBrazilianCurrency } from '@/lib/utils';

interface HeaderSectionProps {
  showHeader: boolean;
  showLogo: boolean;
  discountedValue: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  economyValue?: string;
  totalDebt?: string;
}

const HeaderSection = ({ 
  showHeader, 
  showLogo, 
  discountedValue, 
  colors,
  economyValue,
  totalDebt
}: HeaderSectionProps) => {
  // Calculate the actual economy value (savings)
  const calculateEconomyValue = (): string => {
    if (economyValue) return economyValue;
    
    if (!totalDebt || !discountedValue) return '0,00';
    
    try {
      const totalDebtValue = parseFloat(totalDebt.replace(/\./g, '').replace(',', '.'));
      const discountedVal = parseFloat(discountedValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(totalDebtValue) || isNaN(discountedVal)) return '0,00';
      
      const economy = totalDebtValue - discountedVal;
      return formatBrazilianCurrency(economy);
    } catch (e) {
      console.error('Error calculating economy value:', e);
      return '0,00';
    }
  };

  if (!showHeader) return null;
  
  return (
    <div className="py-2 px-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showLogo && (
            <img 
              src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
              alt="Logo" 
              className="h-5 w-auto" 
            />
          )}
          <h1 className="text-sm font-semibold text-gray-800">
            Proposta de Transação Tributária | PGFN
          </h1>
        </div>
        <div className="text-xs text-gray-700">
          • Economia de R$ {calculateEconomyValue()}
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
