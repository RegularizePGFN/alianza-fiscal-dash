
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { formatBrazilianCurrency } from '@/lib/utils';
import { SectionContainer } from './index';
import DataField from './DataField';

interface NegotiationSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

const NegotiationSection = ({ data, colors }: NegotiationSectionProps) => {
  return (
    <SectionContainer title="Dados da Negociação" colors={colors}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <DataField 
            label="Valor Consolidado:" 
            value={`R$ ${data.totalDebt || "0,00"}`}
            textStyle="font-medium"
          />
          
          <DataField 
            label="Percentual de Desconto:" 
            value={`${data.discountPercentage || "0"}%`}
          />
        </div>
        
        <div>
          <DataField 
            label="Valor com Reduções:" 
            value={`R$ ${data.discountedValue || "0,00"}`}
            valueStyle="text-green-600 font-medium"
          />
          
          <DataField 
            label="Entrada (se aplicável):" 
            value={`R$ ${data.entryValue || "0,00"}`}
          />
        </div>
      </div>
    </SectionContainer>
  );
};

export default NegotiationSection;
