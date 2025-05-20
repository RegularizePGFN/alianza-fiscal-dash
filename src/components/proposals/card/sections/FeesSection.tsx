
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { SectionContainer, DataField } from './index';

interface FeesSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
    accent: string;
  };
  compact?: boolean;
}

const FeesSection = ({ data, colors, compact = false }: FeesSectionProps) => {
  if (!data.feesValue) return null;
  
  return (
    <SectionContainer 
      title="Custos e Honorários" 
      color={colors.secondary}
      compact={compact}
    >
      <DataField 
        label="Honorários Aliança Fiscal" 
        value={`R$ ${data.feesValue}`}
        fullWidth={true}
        className="border-l-4"
        style={{ borderLeftColor: colors.accent }}
        compact={compact}
      />
    </SectionContainer>
  );
};

export default FeesSection;
