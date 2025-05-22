
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FeesDisplaySectionProps {
  data: Partial<ExtractedData>;
}

const FeesDisplaySection = ({ data }: FeesDisplaySectionProps) => {
  if (!data.feesValue) return null;
  
  return (
    <div className="space-y-1.5">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-1 text-af-blue-800">
        Custos e Honorários
      </h3>
      <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-3 rounded-lg border border-purple-200 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold text-purple-800 text-lg">
              Honorários Aliança Fiscal:
            </span>
            <p className="text-sm text-purple-600">
              Pagamento imediato
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-900">R$ {data.feesValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesDisplaySection;
