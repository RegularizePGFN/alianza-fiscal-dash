
import React from 'react';
import { ExtractedData } from '@/lib/types/proposals';
import SectionContainer from './SectionContainer';
import { Calendar } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

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
  
  if (entryDates.length === 0 && installmentDates.length === 0) {
    return null; // Don't render if no dates available
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
  
  // Determine if we need to split the schedule into multiple pages
  const totalRows = entryDates.length + installmentDates.length;
  const rowsPerPage = 20; // Adjust this based on your layout
  const needsMultiplePages = totalRows > rowsPerPage;
  
  // Create the content for entry payments
  const renderEntryPayments = () => {
    return (
      <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4" data-pdf-section="entry-payments">
        <h4 className="text-sm font-medium text-blue-700 mb-2">
          Entrada:
        </h4>
        <div className="bg-white p-3 rounded-md border border-blue-100 overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader className="text-xs text-gray-500">
              <TableRow>
                <TableHead className="text-left pr-4 py-1 w-1/3">Parcela</TableHead>
                <TableHead className="text-left pr-4 py-1 w-1/3">Vencimento</TableHead>
                <TableHead className="text-right py-1 w-1/3">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entryDates.map((item, index) => (
                <TableRow key={`entry-${index}`} className="odd:bg-blue-50 even:bg-white">
                  <TableCell className="pr-4 py-1">{item.installment}ª</TableCell>
                  <TableCell className="pr-4 py-1">{item.formattedDate}</TableCell>
                  <TableCell className="text-right py-1">R$ {entryInstallmentValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  
  // Create the content for installment payments
  const renderInstallmentPayments = () => {
    // Split installments into chunks for pagination if needed
    return (
      <div className="border-l-4 border-green-500 pl-4 py-2" data-pdf-section="installment-payments">
        <h4 className="text-sm font-medium text-green-700 mb-2">
          Após o pagamento da entrada você pagará o restante em {installmentDates.length} parcelas:
        </h4>
        <div className="bg-white p-3 rounded-md border border-green-100 overflow-x-auto">
          <Table className="w-full text-sm">
            <TableHeader className="text-xs text-gray-500">
              <TableRow>
                <TableHead className="text-left pr-4 py-1 w-1/3">Parcela</TableHead>
                <TableHead className="text-left pr-4 py-1 w-1/3">Vencimento</TableHead>
                <TableHead className="text-right py-1 w-1/3">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installmentDates.map((item, index) => (
                <TableRow key={`installment-${index}`} className="odd:bg-green-50 even:bg-white">
                  <TableCell className="pr-4 py-1">{entryDates.length + item.installment}ª</TableCell>
                  <TableCell className="pr-4 py-1">{item.formattedDate}</TableCell>
                  <TableCell className="text-right py-1">R$ {data.installmentValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div 
      data-pdf-page="payment-schedule"
      className="page-break-before print:page-break-before"
    >
      <SectionContainer 
        title="Cronograma de Pagamento" 
        icon={<Calendar className="h-4 w-4" />}
        color={sectionColor}
        fullWidth
      >
        <div className="col-span-2 space-y-4">
          {/* Entry payments */}
          {entryDates.length > 0 && renderEntryPayments()}
          
          {/* Regular installments */}
          {installmentDates.length > 0 && renderInstallmentPayments()}
        </div>
      </SectionContainer>
    </div>
  );
};

export default PaymentScheduleSection;
