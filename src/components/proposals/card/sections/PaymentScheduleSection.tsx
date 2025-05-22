
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface PaymentScheduleSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  showHeader?: boolean;
  className?: string;
}

const PaymentScheduleSection = ({ 
  data, 
  colors,
  showHeader = true,
  className = ""
}: PaymentScheduleSectionProps) => {
  // Parse entry dates and installment dates
  const entryDates = React.useMemo(() => {
    try {
      return data.entryDates ? JSON.parse(data.entryDates) : [];
    } catch (error) {
      console.error('Error parsing entry dates:', error);
      return [];
    }
  }, [data.entryDates]);
  
  const installmentDates = React.useMemo(() => {
    try {
      return data.installmentDates ? JSON.parse(data.installmentDates) : [];
    } catch (error) {
      console.error('Error parsing installment dates:', error);
      return [];
    }
  }, [data.installmentDates]);
  
  // If there are no dates to display, don't render anything
  if (entryDates.length === 0 && installmentDates.length === 0) {
    return null;
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Optional header */}
      {showHeader && (
        <h3 className="text-xs font-semibold border-b pb-1 mb-2" style={{ color: colors.secondary }}>
          Cronograma de Pagamento
        </h3>
      )}
      
      {/* Entry Payments */}
      {entryDates.length > 0 && (
        <div className="mb-2 border-l-2 pl-2 py-1" style={{ borderColor: colors.primary }}>
          <h4 className="text-xs font-medium mb-1" style={{ color: colors.primary }}>
            Entrada:
          </h4>
          <div className="bg-white p-2 rounded border border-gray-200 overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead className="text-[10px] text-gray-500">
                <tr>
                  <th className="text-left pr-4 py-1">Parcela</th>
                  <th className="text-left pr-4 py-1">Vencimento</th>
                  <th className="text-right py-1">Valor</th>
                </tr>
              </thead>
              <tbody>
                {entryDates.map((item: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="pr-4 py-0.5">{item.installment}ª</td>
                    <td className="pr-4 py-0.5">{item.formattedDate}</td>
                    <td className="text-right py-0.5">R$ {data.entryValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Regular Installments */}
      {installmentDates.length > 0 && (
        <div className="border-l-2 pl-2 py-1" style={{ borderColor: colors.accent }}>
          <h4 className="text-xs font-medium mb-1" style={{ color: colors.accent }}>
            {entryDates.length > 0 
              ? `Após o pagamento da entrada você pagará o restante em ${installmentDates.length} parcelas:`
              : "Parcelas:"}
          </h4>
          <div className="bg-white p-2 rounded border border-gray-200 overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead className="text-[10px] text-gray-500">
                <tr>
                  <th className="text-left pr-4 py-1">Parcela</th>
                  <th className="text-left pr-4 py-1">Vencimento</th>
                  <th className="text-right py-1">Valor</th>
                </tr>
              </thead>
              <tbody>
                {installmentDates.map((item: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="pr-4 py-0.5">{entryDates.length + item.installment}ª</td>
                    <td className="pr-4 py-0.5">{item.formattedDate}</td>
                    <td className="text-right py-0.5">R$ {data.installmentValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentScheduleSection;
