
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
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="mb-3">
      <h3 className="text-xs font-semibold pb-1 mb-2 border-b border-gray-200" 
          style={{ color: colors.secondary }}>
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* CNPJ */}
        <div className="bg-gray-50 p-1 rounded">
          <span className="text-xs font-medium text-gray-500">CNPJ:</span>
          <p className="text-xs">{companyData.taxId || '-'}</p>
        </div>
        
        {/* Razão Social / Nome */}
        <div className="bg-gray-50 p-1 rounded md:col-span-2">
          <span className="text-xs font-medium text-gray-500">Razão Social:</span>
          <p className="text-xs">{companyData.company?.name || '-'}</p>
        </div>
        
        {/* Situação */}
        <div className="bg-gray-50 p-1 rounded flex flex-col">
          <span className="text-xs font-medium text-gray-500">
            Situação:
          </span>
          <p className="text-xs">{companyData.status?.text || '-'}</p>
        </div>
        
        {/* Data de Abertura */}
        <div className="bg-gray-50 p-1 rounded flex flex-col">
          <span className="text-xs font-medium text-gray-500">
            Data de Abertura:
          </span>
          <p className="text-xs">{formatDate(companyData.founded) || '-'}</p>
        </div>
        
        {/* Endereço */}
        <div className="bg-gray-50 p-1 rounded md:col-span-2">
          <span className="text-xs font-medium text-gray-500">
            Endereço:
          </span>
          <p className="text-xs">{formatAddress(companyData.address) || '-'}</p>
        </div>
        
        {/* Telefones */}
        {companyData.phones && companyData.phones.length > 0 && (
          <div className="bg-gray-50 p-1 rounded">
            <span className="text-xs font-medium text-gray-500">
              Telefone:
            </span>
            {companyData.phones.map((phone, index) => (
              <p key={index} className="text-xs">
                {phone.area}{phone.number}
              </p>
            )).slice(0, 2)}
          </div>
        )}
        
        {/* Emails */}
        {companyData.emails && companyData.emails.length > 0 && (
          <div className="bg-gray-50 p-1 rounded">
            <span className="text-xs font-medium text-gray-500">
              Email:
            </span>
            {companyData.emails.map((email, index) => (
              <p key={index} className="text-xs break-all">
                {email.address}
              </p>
            )).slice(0, 2)}
          </div>
        )}
        
        {/* Atividade Principal */}
        {companyData.mainActivity && (
          <div className="bg-gray-50 p-1 rounded md:col-span-2">
            <span className="text-xs font-medium text-gray-500">
              Atividade Principal:
            </span>
            <p className="text-xs">{companyData.mainActivity.id} | {companyData.mainActivity.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoSection;
