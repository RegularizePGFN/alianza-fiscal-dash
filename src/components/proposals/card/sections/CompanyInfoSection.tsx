
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
    <div className="mb-4">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" 
          style={{ color: colors.secondary }}>
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-1 gap-3 text-sm">
        {/* CNPJ and Situação row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-sm font-medium text-gray-500">CNPJ:</span>
            <p className="text-sm mt-1">{companyData.taxId || '-'}</p>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-sm font-medium text-gray-500">Situação:</span>
            <p className="text-sm mt-1">{companyData.status?.text || '-'}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-2 rounded">
          <span className="text-sm font-medium text-gray-500">Razão Social:</span>
          <p className="text-sm mt-1">{companyData.company?.name || '-'}</p>
        </div>
        
        {/* Endereço */}
        <div className="bg-gray-50 p-2 rounded">
          <span className="text-sm font-medium text-gray-500">Endereço:</span>
          <p className="text-sm mt-1">{formatAddress(companyData.address) || '-'}</p>
        </div>
        
        {/* Telefone e Email */}
        <div className="grid grid-cols-2 gap-3">
          {companyData.phones && companyData.phones.length > 0 && (
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-sm font-medium text-gray-500">Telefone:</span>
              {companyData.phones.map((phone, index) => (
                <p key={index} className="text-sm mt-1">
                  ({phone.area}) {phone.number}
                </p>
              )).slice(0, 2)}
            </div>
          )}
          
          {companyData.emails && companyData.emails.length > 0 && (
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-sm font-medium text-gray-500">Email:</span>
              {companyData.emails.map((email, index) => (
                <p key={index} className="text-sm mt-1 break-all">
                  {email.address}
                </p>
              )).slice(0, 2)}
            </div>
          )}
        </div>
        
        {/* Atividade Principal */}
        {companyData.mainActivity && (
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-sm font-medium text-gray-500">Atividade Principal:</span>
            <p className="text-sm mt-1">{companyData.mainActivity.id} | {companyData.mainActivity.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoSection;
