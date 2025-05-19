
import React from 'react';
import { CompanyData } from "@/lib/types/proposals";

interface CompanyInfoSectionProps {
  companyData?: CompanyData | null;
  colors: {
    secondary: string;
  };
}

const CompanyInfoSection = ({ companyData, colors }: CompanyInfoSectionProps) => {
  if (!companyData || !companyData.company) return null;
  
  const formatAddress = (address?: CompanyData['address']) => {
    if (!address) return "";
    
    const parts = [
      address.street,
      address.number ? `Nº ${address.number}` : "",
      address.details || "",
      address.district ? `${address.district}` : "",
      address.city && address.state ? `${address.city}/${address.state}` : "",
      address.zip ? `CEP: ${address.zip}` : ""
    ];
    
    return parts.filter(part => part).join(", ");
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" 
          style={{ color: colors.secondary }}>
        Dados da Empresa
      </h3>
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
        {companyData.company?.name && (
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-500">Nome/Razão Social:</span>
            <p className="text-base mt-1">{companyData.company.name}</p>
          </div>
        )}
        
        {companyData.status && (
          <div>
            <span className="text-sm font-medium text-gray-500">Situação:</span>
            <p className="text-base mt-1">{companyData.status.text}</p>
          </div>
        )}
        
        {companyData.founded && (
          <div>
            <span className="text-sm font-medium text-gray-500">Data de Abertura:</span>
            <p className="text-base mt-1">{new Date(companyData.founded).toLocaleDateString('pt-BR')}</p>
          </div>
        )}
        
        {companyData.address && (
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-500">Endereço:</span>
            <p className="text-base mt-1">{formatAddress(companyData.address)}</p>
          </div>
        )}
        
        {companyData.mainActivity && (
          <div className="col-span-2">
            <span className="text-sm font-medium text-gray-500">Atividade Principal:</span>
            <p className="text-base mt-1">{companyData.mainActivity.id} | {companyData.mainActivity.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoSection;
