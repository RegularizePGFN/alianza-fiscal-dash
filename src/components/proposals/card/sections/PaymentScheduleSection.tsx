
import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import SectionContainer from './SectionContainer';
import { Calendar } from 'lucide-react';

interface PaymentScheduleSectionProps {
  data: Partial<ExtractedData>;
  colors?: any;
}

const PaymentScheduleSection = ({ data, colors }: PaymentScheduleSectionProps) => {
  // Default color if not provided
  const sectionColor = colors?.secondary || '#1E40AF';
  
  // Parse payment dates from JSON strings
  let entryDates = [];
  let installmentDates = [];
  
  try {
    if (data.entryDates) {
      entryDates = JSON.parse(data.entryDates);
    }
    if (data.installmentDates) {
      installmentDates = JSON.parse(data.installmentDates);
    }
  } catch (error) {
    console.error('Error parsing payment dates:', error);
  }
  
  // Skip rendering this section if no dates available
  if (entryDates.length === 0 && installmentDates.length === 0) {
    return null;
  }

  // Calculate entry installment value per installment
  const calculateEntryInstallmentValue = () => {
    if (data.entryValue && data.entryInstallments && parseInt(data.entryInstallments) > 1) {
      try {
        const entryValue = parseFloat(data.entryValue.replace(/\./g, '').replace(',', '.'));
        const installments = parseInt(data.entryInstallments);
        
        if (!isNaN(entryValue) && !isNaN(installments) && installments > 0) {
          const installmentValue = entryValue / installments;
          return installmentValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      } catch (error) {
        console.error("Error calculating entry installment value:", error);
      }
    }
    return data.entryValue || "0,00";
  };

  const entryInstallmentValue = calculateEntryInstallmentValue();

  return (
    <SectionContainer 
      title="Cronograma de Pagamento" 
      icon={<Calendar className="h-4 w-4" />}
      color={sectionColor}
      fullWidth
      className="print:page-break-before"
    >
      <div className="col-span-2 space-y-4">
        {/* Entry payments */}
        {entryDates.length > 0 && (
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h4 className="text-sm font-medium text-blue-700 mb-2">
              Entrada:
            </h4>
            <div className="bg-white p-3 rounded-md border border-blue-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="text-left pr-4 py-1">Parcela</th>
                    <th className="text-left pr-4 py-1">Vencimento</th>
                    <th className="text-right py-1">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {entryDates.map((item, index) => (
                    <tr key={`entry-${index}`} className="odd:bg-blue-50 even:bg-white">
                      <td className="pr-4 py-1">{item.installment}ª</td>
                      <td className="pr-4 py-1">{item.formattedDate}</td>
                      <td className="text-right py-1">R$ {entryInstallmentValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Regular installments */}
        {installmentDates.length > 0 && (
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <h4 className="text-sm font-medium text-green-700 mb-2">
              Após o pagamento da entrada você pagará o restante em {installmentDates.length} parcelas:
            </h4>
            <div className="bg-white p-3 rounded-md border border-green-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500">
                  <tr>
                    <th className="text-left pr-4 py-1">Parcela</th>
                    <th className="text-left pr-4 py-1">Vencimento</th>
                    <th className="text-right py-1">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {installmentDates.map((item, index) => (
                    <tr key={`installment-${index}`} className="odd:bg-green-50 even:bg-white">
                      <td className="pr-4 py-1">{entryDates.length + item.installment}ª</td>
                      <td className="pr-4 py-1">{item.formattedDate}</td>
                      <td className="text-right py-1">R$ {data.installmentValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  );
};

export default PaymentScheduleSection;
