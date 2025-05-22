
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface ProposalDataSectionProps {
  data: Partial<ExtractedData>;
}

const ProposalDataSection = ({ data }: ProposalDataSectionProps) => {
  return (
    <>
      {/* Contribuinte Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-md border-b border-gray-200 pb-1 text-gray-800">
          Dados do Contribuinte
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
            <span className="font-medium text-gray-700 text-sm">CNPJ:</span>
            <p className="text-base">{data.cnpj || '-'}</p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
            <span className="font-medium text-gray-700 text-sm">Número do Débito:</span>
            <p className="text-base">{data.debtNumber || '-'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalDataSection;
