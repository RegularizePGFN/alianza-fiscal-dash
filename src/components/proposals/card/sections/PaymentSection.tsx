
import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import SectionContainer from './SectionContainer';
import DataField from './DataField';
import PaymentScheduleSection from './PaymentScheduleSection';
import { CreditCard } from 'lucide-react';

interface PaymentSectionProps {
  data: Partial<ExtractedData>;
  colors?: any;
}

const PaymentSection = ({ data, colors }: PaymentSectionProps) => {
  // Default color if not provided
  const sectionColor = colors?.secondary || '#1E40AF';

  return (
    <SectionContainer 
      title="Opções de Pagamento" 
      icon={<CreditCard className="h-4 w-4" />}
      color={sectionColor}
    >
      <DataField 
        label="À Vista" 
        value={`R$ ${data.discountedValue || '0,00'}`}
      />
      <DataField 
        label="Parcelado" 
        value={`${data.installments || '0'}x de R$ ${data.installmentValue || '0,00'}`}
        description={`Entrada: ${data.entryInstallments || '1'}x de R$ ${data.entryValue || '0,00'}`}
      />
    </SectionContainer>
  );
};

export default PaymentSection;
