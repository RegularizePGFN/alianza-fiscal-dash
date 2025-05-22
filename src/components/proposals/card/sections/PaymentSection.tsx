
import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import SectionContainer from './SectionContainer';
import DataField from './DataField';

interface PaymentSectionProps {
  data: Partial<ExtractedData>;
  colors?: any;
}

const PaymentSection = ({ data, colors }: PaymentSectionProps) => {
  // Default color if not provided
  const sectionColor = colors?.secondary || '#1E40AF';

  // If no payment data is available, don't render the section
  if (!data.discountedValue && !data.installments && !data.installmentValue) {
    return null;
  }

  return (
    <SectionContainer 
      title="Opções de Pagamento" 
      icon={null}
      color={sectionColor}
    >
      <DataField 
        label="À Vista" 
        value={`R$ ${data.discountedValue || '0,00'}`}
      />
      <DataField 
        label="Parcelado" 
        value={`${data.installments || '0'}x de R$ ${data.installmentValue || '0,00'}`}
      />
      {data.entryValue && (
        <DataField 
          label="Entrada" 
          value={`${data.entryInstallments || '1'}x de R$ ${data.entryValue}`}
        />
      )}
      {data.feesValue && (
        <DataField 
          label="Honorários à Vista" 
          value={`R$ ${data.feesValue}`}
          className="mt-2"
        />
      )}
      {data.feesInstallmentValue && (
        <DataField 
          label="Honorários Parcelados" 
          value={`${data.feesInstallments || '0'}x de R$ ${data.feesInstallmentValue}`}
          className="mt-0"
        />
      )}
    </SectionContainer>
  );
};

export default PaymentSection;
