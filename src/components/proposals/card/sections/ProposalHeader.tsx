
import React from 'react';

interface ProposalHeaderProps {
  totalDebt?: string;
  discountedValue?: string;
}

const ProposalHeader = ({ totalDebt, discountedValue }: ProposalHeaderProps) => {
  // Calculate the potential savings
  const calculateSavings = () => {
    if (!totalDebt || !discountedValue) return "0,00";
    
    try {
      // Parse values, handling BR currency format
      const totalValue = parseFloat(totalDebt.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      const discountValue = parseFloat(discountedValue.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
      
      if (isNaN(totalValue) || isNaN(discountValue)) return "0,00";
      
      const savings = totalValue - discountValue;
      // Format back to BR currency
      return savings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (error) {
      console.error("Error calculating savings:", error);
      return "0,00";
    }
  };

  return (
    <div className="rounded-t-none bg-af-blue-700 text-white p-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
          alt="Aliança Fiscal" 
          className="h-10 w-auto object-contain"
        />
        <div>
          <h2 className="font-semibold text-lg tracking-tight">Proposta de Regularização | Procuradoria Geral</h2>
          <p className="text-xs text-af-blue-100">Aliança Fiscal</p>
        </div>
      </div>
      
      {totalDebt && discountedValue && (
        <div className="bg-af-green-600 px-3 py-1 rounded text-sm font-medium">
          Economia de R$ {calculateSavings()}
        </div>
      )}
    </div>
  );
};

export default ProposalHeader;
