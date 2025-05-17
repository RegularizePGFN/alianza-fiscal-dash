
import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentOptionsSectionProps {
  discountedValue: string;
  installments: string;
  installmentValue: string;
  entryValue: string;
  entryInstallments: string;
}

const PaymentOptionsSection = ({ 
  discountedValue, 
  installments, 
  installmentValue, 
  entryValue,
  entryInstallments
}: PaymentOptionsSectionProps) => {
  return (
    <div className="bg-white p-3 rounded-lg border border-af-blue-200 shadow-sm">
      <h3 className="text-xs font-semibold text-af-blue-800 mb-2 flex items-center">
        <CreditCard className="mr-1 h-3 w-3 flex-shrink-0 text-af-blue-600" />
        Opções de Pagamento
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-af-blue-100 rounded p-2 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-xs">À Vista</p>
          <p className="text-sm font-bold">R$ {discountedValue || '0,00'}</p>
        </div>
        <div className="border border-af-blue-100 rounded p-2 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-xs">Parcelado</p>
          <p className="text-sm font-bold">{installments || '0'}x de R$ {installmentValue || '0,00'}</p>
          <div className="mt-1">
            <p className="text-xs text-gray-500">
              <span className="flex items-start">
                <span className="inline-block w-[4px] h-[4px] rounded-full bg-gray-400 mr-1.5 mt-1 flex-shrink-0"></span>
                <span>Entrada: {entryInstallments || '1'}x de R$ {entryValue || '0,00'}</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsSection;
