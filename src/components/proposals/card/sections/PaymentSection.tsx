
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { formatBrazilianCurrency } from '@/lib/utils';
import { SectionContainer } from './index';
import DataField from './DataField';

interface PaymentSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

const PaymentSection = ({ data, colors }: PaymentSectionProps) => {
  return (
    <SectionContainer title="Opções de Pagamento" colors={colors}>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="border rounded p-2">
          <h4 className="font-medium text-sm mb-1">À Vista</h4>
          <DataField 
            label="Total:" 
            value={`R$ ${data.discountedValue || "0,00"}`}
            valueStyle="font-medium"
          />
        </div>
        
        <div className="border rounded p-2">
          <h4 className="font-medium text-sm mb-1">Parcelado</h4>
          <DataField 
            label={`${data.installments || "0"} parcelas de:`}
            value={`R$ ${data.installmentValue || "0,00"}`}
            valueStyle="font-medium"
          />
          {data.entryValue && parseFloat(data.entryValue.replace(/\./g, '').replace(',', '.')) > 0 && (
            <DataField 
              label="Entrada de:" 
              value={`R$ ${data.entryValue}`}
              textSize="xs"
            />
          )}
        </div>
      </div>
    </SectionContainer>
  );
};

export default PaymentSection;
