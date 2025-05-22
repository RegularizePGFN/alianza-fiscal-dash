
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FeesDisplaySectionProps {
  data: Partial<ExtractedData>;
}

const FeesDisplaySection = ({
  data
}: FeesDisplaySectionProps) => {
  if (!data.feesValue) return null;
  
  // Display installment fees if available and showInstallmentFees is true
  const showInstallmentFees = 
    data.showFeesInstallments === 'true' && 
    data.feesInstallmentValue && 
    data.feesInstallments && 
    parseInt(data.feesInstallments) > 1;
    
  // Payment method display name
  const paymentMethod = data.feesPaymentMethod === 'cartao' ? 'no cartão' : 'via boleto';

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-1 mb-3 text-af-blue-800">
        Custos e Honorários
      </h3>
      
      {showInstallmentFees ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-3 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-purple-800 text-lg">
                  Honorários Aliança Fiscal:
                </span>
                <p className="text-sm text-purple-600">
                  Pagamento imediato
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-900">R$ {data.feesValue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-3 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-purple-800 text-lg">
                  Honorários Aliança Fiscal:
                </span>
                <p className="text-sm text-purple-600">
                  Pagamento parcelado
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-900">R$ {data.feesTotalInstallmentValue}</p>
                <p className="text-xs text-purple-700">
                  {data.feesInstallments}x de R$ {data.feesInstallmentValue} {paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-3 rounded-lg border border-purple-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-purple-800 text-lg">
                Honorários Aliança Fiscal:
              </span>
              <p className="text-sm text-purple-600">
                Pagamento imediato
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-900">R$ {data.feesValue}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesDisplaySection;
