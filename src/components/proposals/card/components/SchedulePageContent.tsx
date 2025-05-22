
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { PaymentScheduleSection } from '../sections';

interface SchedulePageContentProps {
  data: Partial<ExtractedData>;
  colors: any;
  totalPages: number;
}

/**
 * Renders the content for the payment schedule page of the proposal (page 1+)
 */
const SchedulePageContent = ({ data, colors, totalPages }: SchedulePageContentProps) => {
  return (
    <>
      {/* Simple header for payment schedule */}
      <div className="border-b border-gray-200 pb-2 mb-2">
        <h2 className="text-sm font-semibold text-center" style={{ color: colors.secondary }}>
          Cronograma de Pagamento
        </h2>
      </div>
      
      {/* Payment schedule content - make it scrollable if needed */}
      <div className="pb-2 h-[calc(100%-60px)]">
        <PaymentScheduleSection 
          data={data} 
          colors={colors} 
          showHeader={false} 
        />
      </div>
      
      <div className="absolute bottom-2 right-4 text-[10px] text-gray-500 print:block hidden">
        Página 2 de {totalPages}
      </div>
    </>
  );
};

export default SchedulePageContent;
