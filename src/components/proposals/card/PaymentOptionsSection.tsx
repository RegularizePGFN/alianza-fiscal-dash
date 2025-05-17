
import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentOptionsSectionProps {
  discountedValue: string;
  installments: string;
  installmentValue: string;
  entryValue: string;
  entryInstallments?: string;
}

const PaymentOptionsSection = ({ 
  discountedValue, 
  installments, 
  installmentValue, 
  entryValue,
  entryInstallments
}: PaymentOptionsSectionProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-af-blue-200 shadow-sm">
      <h3 className="text-sm font-semibold text-af-blue-800 mb-3 flex items-center">
        <CreditCard className="mr-2 h-4 w-4 flex-shrink-0 text-af-blue-600" />
        Opções de Pagamento
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-af-blue-100 rounded p-3 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-sm">À Vista</p>
          <p className="text-base font-bold">R$ {discountedValue || '0,00'}</p>
        </div>
        <div className="border border-af-blue-100 rounded p-3 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-sm">Parcelado</p>
          <p className="text-lg font-bold">{installments || '0'}x de R$ {installmentValue || '0,00'}</p>
          <div className="mt-1">
            <p className="text-xs text-gray-500 flex items-start">
              <span className="inline-block w-[5px] h-[5px] rounded-full bg-gray-400 mr-1.5 mt-1.5 flex-shrink-0"></span>
              <span>Entrada de R$ {entryValue || '0,00'} {entryInstallments && entryInstallments !== '1' ? `(${entryInstallments}x)` : ''}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsSection;
