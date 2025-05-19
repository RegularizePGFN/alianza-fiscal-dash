
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FeesSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
    accent: string;
  };
}

const FeesSection = ({ data, colors }: FeesSectionProps) => {
  if (!data.feesValue) return null;
  
  // Get specialist name
  const specialistName = data.specialistName || 'Especialista Tributário';
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200"
          style={{ color: colors.secondary }}>
        Custos e Honorários
      </h3>
      <div className="bg-gray-50 p-3 rounded border-l-4" style={{ borderLeftColor: colors.accent }}>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Honorários Aliança Fiscal:
            </span>
            <p className="text-sm mt-1 text-gray-500">
              Especialista Tributário - {specialistName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium" style={{ color: colors.accent }}>
              R$ {data.feesValue}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesSection;
