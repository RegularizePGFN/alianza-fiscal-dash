
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface PaymentOptionsDisplayProps {
  data: Partial<ExtractedData>;
}

const PaymentOptionsDisplay = ({ data }: PaymentOptionsDisplayProps) => {
  return (
    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        Opções de Pagamento
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-gray-100 rounded p-2 hover:bg-gray-50 transition-colors">
          <p className="font-medium text-gray-700 text-xs">À Vista</p>
          <p className="text-sm font-bold">R$ {data.discountedValue || '0,00'}</p>
        </div>
        <div className="border border-gray-100 rounded p-2 hover:bg-gray-50 transition-colors">
          <p className="font-medium text-gray-700 text-xs">Parcelado</p>
          <p className="text-sm font-bold">{data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsDisplay;
