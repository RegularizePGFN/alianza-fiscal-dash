
import React from 'react';
import { CreditCard, BriefcaseIcon, Info } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";

interface FeesDisplaySectionProps {
  data: Partial<ExtractedData>;
}

const FeesDisplaySection = ({ data }: FeesDisplaySectionProps) => {
  if (!data.feesValue) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
        <CreditCard className="mr-2 h-5 w-5 text-af-blue-600" />
        Custos e Honorários
      </h3>
      <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-5 rounded-lg border border-purple-200 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold text-purple-800 flex items-center text-lg">
              <BriefcaseIcon className="mr-2 h-5 w-5 text-purple-700" />
              Honorários Aliança Fiscal:
            </span>
            <p className="text-sm text-purple-600 mt-1">
              <Info className="inline-block mr-1 h-4 w-4" />
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
