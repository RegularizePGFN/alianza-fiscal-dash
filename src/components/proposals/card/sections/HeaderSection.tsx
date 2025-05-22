
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
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
    <CardHeader 
      className="bg-gradient-to-r from-af-blue-600 to-af-blue-800 text-white pb-8"
      style={{
        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          {showLogo && (
            <img 
              src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
              alt="Logo" 
              className="h-14 w-auto"
            />
          )}
          <CardTitle className="text-2xl font-bold text-white">
            Proposta de Parcelamento PGFN
          </CardTitle>
        </div>
        <Badge 
          className="text-white text-sm py-1.5 px-3"
          style={{
            backgroundColor: colors.accent,
          }}
        >
          Economia de R$ {calculateEconomyValue()}
        </Badge>
      </div>
    </CardHeader>
  );
};

export default HeaderSection;
