
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FeesDisplaySectionProps {
  data: Partial<ExtractedData>;
}

const FeesDisplaySection = ({ data }: FeesDisplaySectionProps) => {
  if (!data.feesValue) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm border-b border-gray-200 pb-1 text-gray-800">
        Custos e Honorários
      </h3>
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-2 rounded-md border border-purple-100 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold text-purple-800 text-xs">
              Honorários Aliança Fiscal:
            </span>
            <p className="text-xs text-purple-600 mt-0.5">
              Pagamento imediato
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-purple-900">R$ {data.feesValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesDisplaySection;
