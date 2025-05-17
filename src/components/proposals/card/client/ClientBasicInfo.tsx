
import React from 'react';

interface ClientBasicInfoProps {
  cnpj: string;
  debtNumber: string;
  hasCompanyData: boolean;
}

const ClientBasicInfo = ({ 
  cnpj, 
  debtNumber, 
  hasCompanyData
}: ClientBasicInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-50 border border-af-blue-100 p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-medium text-af-blue-700">CNPJ:</span>
            <p className="text-lg">{cnpj || '-'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 border border-af-blue-100 p-4">
        <span className="font-medium text-af-blue-700">Número do Débito:</span>
        <p className="text-lg">{debtNumber || '-'}</p>
      </div>
    </div>
  );
};

export default ClientBasicInfo;
