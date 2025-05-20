
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { SectionContainer } from './index';
import DataField from './DataField';

interface FeesSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

const FeesSection = ({ data, colors }: FeesSectionProps) => {
  return (
    <SectionContainer title="Custos e Honorários" colors={colors}>
      <div className="grid grid-cols-1 gap-1 text-sm">
        <div className="flex justify-between items-center border-b pb-1">
          <span>Honorários Aliança Fiscal:</span>
          <span className="font-medium text-green-600">{`R$ ${data.feesValue || "0,00"}`}</span>
        </div>
      </div>
    </SectionContainer>
  );
};

export default FeesSection;
