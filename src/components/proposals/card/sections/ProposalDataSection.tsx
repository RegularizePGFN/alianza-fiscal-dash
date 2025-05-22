
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface ProposalDataSectionProps {
  data: Partial<ExtractedData>;
}

const ProposalDataSection = ({ data }: ProposalDataSectionProps) => {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-semibold mb-2 text-gray-800 border-b pb-1">
        Dados do Contribuinte
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <div>
          <p className="text-[10px] text-gray-600">CNPJ:</p>
          <p>{data.cnpj || '-'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600">Razão Social:</p>
          <p>{data.clientName || '-'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600">Situação:</p>
          <p>{data.situation || '-'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600">Data de Abertura:</p>
          <p>{data.openingDate || '-'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] text-gray-600">Endereço:</p>
          <p>{data.address || '-'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600">Telefone:</p>
          <p>{data.clientPhone || '-'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-600">Email:</p>
          <p>{data.clientEmail || '-'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[10px] text-gray-600">Atividade Principal:</p>
          <p>{data.businessActivity || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProposalDataSection;
