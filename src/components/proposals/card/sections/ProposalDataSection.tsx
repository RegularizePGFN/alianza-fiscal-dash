
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface ProposalDataSectionProps {
  data: Partial<ExtractedData>;
}

const ProposalDataSection = ({ data }: ProposalDataSectionProps) => {
  return (
    <>
      {/* Contribuinte Section */}
      <div className="space-y-1.5">
        <h3 className="font-semibold text-sm border-b border-af-blue-200 pb-0.5 text-af-blue-800">
          Dados do Contribuinte
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-1.5 rounded-md">
            <span className="font-medium text-xs text-af-blue-700">CNPJ:</span>
            <p className="text-sm">{data.cnpj || '-'}</p>
          </div>
          <div className="p-1.5 rounded-md">
            <span className="font-medium text-xs text-af-blue-700">Número do Débito:</span>
            <p className="text-sm">{data.debtNumber || '-'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalDataSection;
