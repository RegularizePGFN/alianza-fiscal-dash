
import React from 'react';
import { BriefcaseIcon } from 'lucide-react';
import { CompanyData } from "@/lib/types/proposals";
import {
  CompanyDataDetails,
  ClientSimpleInfo,
  ClientManualInfo,
} from './client';

interface CompanyInfo {
  name?: string;
  phones?: string[];
  emails?: string[];
  businessActivity?: string;
}

interface ClientSectionProps {
  cnpj: string;
  debtNumber: string;
  businessActivity?: string;
  companyInfo?: CompanyInfo;
  companyData?: CompanyData | null;
  onSearchCnpj: () => void;
  isSearching: boolean;
}

const ClientSection = ({ 
  cnpj,
  debtNumber,
  businessActivity,
  companyInfo, 
  companyData,
}: ClientSectionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-base border-b border-af-blue-200 pb-1 text-af-blue-800 flex items-center">
        <BriefcaseIcon className="mr-2 h-4 w-4 flex-shrink-0 text-af-blue-600" />
        Dados do Contribuinte
      </h3>
      
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-white p-2 rounded-md border border-af-blue-100">
          <span className="text-xs font-medium text-af-blue-700">CNPJ:</span>
          <p className="text-sm">{cnpj || '-'}</p>
        </div>
        
        <div className="bg-white p-2 rounded-md border border-af-blue-100">
          <span className="text-xs font-medium text-af-blue-700">Número do Débito:</span>
          <p className="text-sm">{debtNumber || '-'}</p>
        </div>
      </div>
      
      {companyData && <CompanyDataDetails companyData={companyData} />}
      
      {businessActivity && !companyData && (
        <ClientSimpleInfo businessActivity={businessActivity} />
      )}
      
      {companyInfo && !companyData && (
        <ClientManualInfo companyInfo={companyInfo} />
      )}
    </div>
  );
};

export default ClientSection;
