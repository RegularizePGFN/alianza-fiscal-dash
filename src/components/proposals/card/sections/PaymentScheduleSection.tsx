
import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import SectionContainer from './SectionContainer';

interface PaymentScheduleSectionProps {
  data: Partial<ExtractedData>;
  colors?: any;
  showHeader?: boolean;
}

const PaymentScheduleSection = ({ data, colors, showHeader = true }: PaymentScheduleSectionProps) => {
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
  
  if (entryDates.length === 0 && installmentDates.length === 0) {
    return null; // Don't render if no dates available
  }

  const content = (
    <div className="space-y-5">
      {/* Entry payments */}
      {entryDates.length > 0 && (
        <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
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
                  <tr key={`entry-${index}`} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                    <td className="pr-4 py-1">{item.installment}ª</td>
                    <td className="pr-4 py-1">{item.formattedDate}</td>
                    <td className="text-right py-1">R$ {data.entryValue}</td>
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
            {entryDates.length > 0 
              ? "Após o pagamento da entrada você pagará o restante em " + installmentDates.length + " parcelas:"
              : "Parcelas:"}
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
                  <tr key={`installment-${index}`} className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}>
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
  );

  // If showHeader is false, just return the content without the SectionContainer
  if (!showHeader) {
    return content;
  }

  // Otherwise, wrap the content in a SectionContainer with header
  return (
    <SectionContainer 
      title="Cronograma de Pagamento" 
      icon={null}
      color={sectionColor}
      fullWidth
    >
      {content}
    </SectionContainer>
  );
};

export default PaymentScheduleSection;
