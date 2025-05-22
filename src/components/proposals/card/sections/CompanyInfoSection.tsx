
import React from 'react';
import { CompanyData } from "@/lib/types/proposals";
import { Phone, Mail, MapPin, Calendar, CheckCircle, Briefcase } from 'lucide-react';

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
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" 
          style={{ color: colors.secondary }}>
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CNPJ */}
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">CNPJ:</span>
          <p className="text-base mt-1">{companyData.taxId || '-'}</p>
        </div>
        
        {/* Razão Social / Nome */}
        <div className="bg-gray-50 p-3 rounded md:col-span-2">
          <span className="text-sm font-medium text-gray-500">Razão Social:</span>
          <p className="text-base mt-1">{companyData.company?.name || '-'}</p>
        </div>
        
        {/* Situação */}
        <div className="bg-gray-50 p-3 rounded flex flex-col">
          <span className="text-sm font-medium text-gray-500 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" /> Situação:
          </span>
          <p className="text-base mt-1">{companyData.status?.text || '-'}</p>
        </div>
        
        {/* Data de Abertura */}
        <div className="bg-gray-50 p-3 rounded flex flex-col">
          <span className="text-sm font-medium text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" /> Data de Abertura:
          </span>
          <p className="text-base mt-1">{formatDate(companyData.founded) || '-'}</p>
        </div>
        
        {/* Endereço */}
        <div className="bg-gray-50 p-3 rounded md:col-span-2">
          <span className="text-sm font-medium text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" /> Endereço:
          </span>
          <p className="text-base mt-1">{formatAddress(companyData.address) || '-'}</p>
        </div>
        
        {/* Telefones */}
        {companyData.phones && companyData.phones.length > 0 && (
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm font-medium text-gray-500 flex items-center">
              <Phone className="h-3 w-3 mr-1" /> Telefone:
            </span>
            {companyData.phones.map((phone, index) => (
              <p key={index} className="text-base mt-1">
                {phone.area}{phone.number}
              </p>
            )).slice(0, 2)}
          </div>
        )}
        
        {/* Emails */}
        {companyData.emails && companyData.emails.length > 0 && (
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm font-medium text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" /> Email:
            </span>
            {companyData.emails.map((email, index) => (
              <p key={index} className="text-base mt-1 break-all">
                {email.address}
              </p>
            )).slice(0, 2)}
          </div>
        )}
        
        {/* Atividade Principal */}
        {companyData.mainActivity && (
          <div className="bg-gray-50 p-3 rounded md:col-span-2">
            <span className="text-sm font-medium text-gray-500 flex items-center">
              <Briefcase className="h-3 w-3 mr-1" /> Atividade Principal:
            </span>
            <p className="text-base mt-1">{companyData.mainActivity.id} | {companyData.mainActivity.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoSection;
