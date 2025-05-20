
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface ClientSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
  };
}

const ClientSection = ({ data, colors }: ClientSectionProps) => {
  // Usar apenas o valor específico de clientName vindo dos dados da proposta, sem usar o usuário logado
  const clientName = data.clientName;
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" 
          style={{ color: colors.secondary }}>
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">CNPJ:</span>
          <p className="text-base mt-1">{data.cnpj || '-'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">Número do Débito:</span>
          <p className="text-base mt-1">{data.debtNumber || '-'}</p>
        </div>
        {clientName && (
          <div className="bg-gray-50 p-3 rounded col-span-2">
            <span className="text-sm font-medium text-gray-500">Razão Social:</span>
            <p className="text-base mt-1">{clientName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSection;
