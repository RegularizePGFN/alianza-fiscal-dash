
import React from 'react';

interface HeaderSectionProps {
  showLogo: boolean;
  showHeader: boolean;
  discountedValue: string;
  colors: {
    secondary: string;
    background: string;
    accent: string;
  };
}

const HeaderSection = ({ showLogo, showHeader, discountedValue, colors }: HeaderSectionProps) => {
  if (!showHeader) return null;
  
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-slate-400 to-slate-100"></div>
      <div className="relative p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {showLogo && (
            <img 
              src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
              alt="Logo" 
              className="h-12 w-auto"
            />
          )}
          <h2 className="text-xl font-medium" style={{ color: colors.secondary }}>
            Proposta de Parcelamento PGFN
          </h2>
        </div>
        
        <div className="bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium">
          <span>Economia de</span>{" "}
          <span style={{ color: colors.accent }}>R$ {discountedValue || '0,00'}</span>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
