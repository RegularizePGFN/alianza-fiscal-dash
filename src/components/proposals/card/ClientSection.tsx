
import React from 'react';
import { BriefcaseIcon } from 'lucide-react';
import { CompanyData } from "@/lib/types/proposals";
import {
  ClientBasicInfo,
  ClientSimpleInfo,
  ClientManualInfo,
  CompanyDataDetails,
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
  onSearchCnpj,
  isSearching
}: ClientSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
        <BriefcaseIcon className="mr-2 h-5 w-5 text-af-blue-600" />
        Dados do Contribuinte
      </h3>
      
      <ClientBasicInfo
        cnpj={cnpj}
        debtNumber={debtNumber}
        onSearchCnpj={onSearchCnpj}
        isSearching={isSearching}
        hasCompanyData={!!companyData}
      />
      
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
