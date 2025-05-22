
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface ProposalDataSectionProps {
  data: Partial<ExtractedData>;
}

const ProposalDataSection = ({ data }: ProposalDataSectionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm border-b border-gray-200 pb-1 text-gray-800">
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-2 rounded-md shadow-sm border border-gray-100">
          <span className="font-medium text-gray-700 text-xs">CNPJ:</span>
          <p className="text-xs">{data.cnpj || '-'}</p>
        </div>
        <div className="bg-white p-2 rounded-md shadow-sm border border-gray-100">
          <span className="font-medium text-gray-700 text-xs">Número do Débito:</span>
          <p className="text-xs">{data.debtNumber || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProposalDataSection;
