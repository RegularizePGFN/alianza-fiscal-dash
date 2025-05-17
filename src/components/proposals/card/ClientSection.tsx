
import React from 'react';
import { BriefcaseIcon } from 'lucide-react';

interface ClientSectionProps {
  cnpj: string;
  debtNumber: string;
}

const ClientSection = ({ cnpj, debtNumber }: ClientSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
        <BriefcaseIcon className="mr-2 h-5 w-5 text-af-blue-600" />
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700">CNPJ:</span>
          <p className="text-lg">{cnpj || '-'}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
          <span className="font-medium text-af-blue-700">Número do Débito:</span>
          <p className="text-lg">{debtNumber || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientSection;
