
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface PaymentOptionsDisplayProps {
  data: Partial<ExtractedData>;
}

const PaymentOptionsDisplay = ({ data }: PaymentOptionsDisplayProps) => {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-semibold mb-2 text-gray-800 border-b pb-1">
        Opções de Pagamento
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <p className="text-[10px] text-gray-600">À Vista:</p>
          <p>R$ {data.discountedValue || '0,00'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600">Parcelado:</p>
          <p>{data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</p>
        </div>
        {data.entryValue && (
          <div>
            <p className="text-[10px] text-gray-600">Entrada:</p>
            <p>{data.entryInstallments || '1'}x de R$ {data.entryValue}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentOptionsDisplay;
