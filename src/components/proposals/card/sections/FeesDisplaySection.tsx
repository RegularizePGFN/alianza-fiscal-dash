
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FeesDisplaySectionProps {
  data: Partial<ExtractedData>;
}

const FeesDisplaySection = ({ data }: FeesDisplaySectionProps) => {
  if (!data.feesValue) return null;
  
  return (
    <div className="mb-3">
      <h2 className="text-xs font-semibold mb-2 text-gray-800 border-b pb-1">
        Honorários
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <p className="text-[10px] text-gray-600">Honorários à Vista:</p>
          <p>R$ {data.feesValue}</p>
        </div>
        {data.feesInstallmentValue && (
          <div>
            <p className="text-[10px] text-gray-600">Honorários Parcelados:</p>
            <p>{data.feesInstallments || '0'}x de R$ {data.feesInstallmentValue} no cartão</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeesDisplaySection;
