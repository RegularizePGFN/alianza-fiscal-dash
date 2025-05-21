
import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import SectionContainer from './SectionContainer';
import DataField from './DataField';
import { CreditCard, Calendar } from 'lucide-react';

interface FeesSectionProps {
  data: Partial<ExtractedData>;
  colors?: any;
}

const FeesSection = ({ data, colors }: FeesSectionProps) => {
  // Default color if not provided
  const sectionColor = colors?.secondary || '#1E40AF';
  
  // Payment method display name
  const paymentMethod = data.feesPaymentMethod === 'cartao' ? 'no cartão' : 'via boleto';
  
  // Display installment fees if available
  const showInstallmentFees = 
    data.feesInstallmentValue && 
    data.feesInstallments && 
    parseInt(data.feesInstallments) > 1;

  return (
    <SectionContainer 
      title="Honorários" 
      icon={<CreditCard className="h-4 w-4" />}
      color={sectionColor}
    >
      <DataField 
        label="Honorários à Vista" 
        value={`R$ ${data.feesValue || '0,00'}`}
        highlight={true}
        className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800/50"
        description="Valor calculado em 20% da economia obtida"
      />
      
      {showInstallmentFees && (
        <DataField 
          label={`Honorários Parcelados (${data.feesInstallments}x)`}
          value={`${data.feesInstallments}x de R$ ${data.feesInstallmentValue} ${paymentMethod}`}
          highlight={true}
          className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800/50"
          description={`Total: R$ ${data.feesTotalInstallmentValue || data.feesValue || '0,00'}`}
        />
      )}
    </SectionContainer>
  );
};

export default FeesSection;
