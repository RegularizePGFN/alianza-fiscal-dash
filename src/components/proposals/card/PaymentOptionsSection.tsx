
import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentOptionsSectionProps {
  discountedValue: string;
  installments: string;
  installmentValue: string;
  entryValue: string;
}

const PaymentOptionsSection = ({ 
  discountedValue, 
  installments, 
  installmentValue, 
  entryValue 
}: PaymentOptionsSectionProps) => {
  return (
    <div className="bg-white p-5 rounded-lg border border-af-blue-200 shadow-sm">
      <h3 className="text-lg font-semibold text-af-blue-800 mb-4 flex items-center">
        <CreditCard className="mr-2 h-5 w-5 text-af-blue-600" />
        Opções de Pagamento
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-af-blue-100 rounded p-4 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700">À Vista</p>
          <p className="text-lg font-bold">R$ {discountedValue || '0,00'}</p>
        </div>
        <div className="border border-af-blue-100 rounded p-4 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700">Parcelado</p>
          <p className="text-lg font-bold">{installments || '0'}x de R$ {installmentValue || '0,00'}</p>
          <p className="text-xs text-gray-500">Entrada de R$ {entryValue || '0,00'}</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsSection;
