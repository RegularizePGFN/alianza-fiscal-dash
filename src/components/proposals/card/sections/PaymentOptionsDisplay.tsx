
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface PaymentOptionsDisplayProps {
  data: Partial<ExtractedData>;
}

const PaymentOptionsDisplay = ({ data }: PaymentOptionsDisplayProps) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-af-blue-200 shadow-sm">
      <h3 className="text-lg font-semibold text-af-blue-800 mb-4">
        Opções de Pagamento
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-af-blue-100 rounded p-4 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700">À Vista</p>
          <p className="text-lg font-bold">R$ {data.discountedValue || '0,00'}</p>
        </div>
        <div className="border border-af-blue-100 rounded p-4 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700">Parcelado</p>
          <p className="text-lg font-bold">{data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsDisplay;
