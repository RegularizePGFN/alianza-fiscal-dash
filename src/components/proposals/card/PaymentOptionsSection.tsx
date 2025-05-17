
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
    <div className="bg-white p-1.5 rounded-lg border border-af-blue-200 shadow-sm">
      <h3 className="text-[10px] font-semibold text-af-blue-800 mb-1 flex items-center">
        <CreditCard className="mr-1 h-2.5 w-2.5 flex-shrink-0 text-af-blue-600" />
        Opções de Pagamento
      </h3>
      <div className="grid grid-cols-2 gap-1">
        <div className="border border-af-blue-100 rounded p-1 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-[10px]">À Vista</p>
          <p className="text-[11px] font-bold">R$ {discountedValue || '0,00'}</p>
        </div>
        <div className="border border-af-blue-100 rounded p-1 hover:bg-af-blue-50 transition-colors">
          <p className="font-medium text-af-blue-700 text-[10px]">Parcelado</p>
          <p className="text-[11px] font-bold">{installments || '0'}x de R$ {installmentValue || '0,00'}</p>
          <div>
            <p className="text-[9px] text-gray-500 leading-tight">
              <span>Entrada: {entryInstallments || '1'}x de R$ {entryValue || '0,00'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsSection;
