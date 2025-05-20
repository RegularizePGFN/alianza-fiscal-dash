
import React from 'react';
import { CompanyData } from "@/lib/types/proposals";
import { SectionContainer } from './index';
import DataField from './DataField';

interface CompanyInfoSectionProps {
  companyData: CompanyData;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

const CompanyInfoSection = ({ companyData, colors }: CompanyInfoSectionProps) => {
  return (
    <SectionContainer title="Dados do Contribuinte" colors={colors}>
      <div className="text-sm space-y-0">
        {companyData.taxId && (
          <DataField label="CNPJ:" value={companyData.taxId} />
        )}
        
        {companyData.company?.name && (
          <DataField 
            label="Razão Social:" 
            value={companyData.company.name} 
            textStyle="font-medium"
          />
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {companyData.status?.text && (
            <DataField label="Situação:" value={companyData.status.text} />
          )}
          
          {companyData.founded && (
            <DataField label="Data de Abertura:" value={companyData.founded} />
          )}
        </div>
        
        {companyData.address && (
          <DataField 
            label="Endereço:" 
            value={formatAddress(companyData.address)} 
            textSize="xs"
          />
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {companyData.phones && companyData.phones.length > 0 && (
            <DataField 
              label="Telefone:" 
              value={formatPhone(companyData.phones[0])} 
              textSize="xs"
            />
          )}
          
          {companyData.emails && companyData.emails.length > 0 && (
            <DataField 
              label="Email:" 
              value={companyData.emails[0].address} 
              textSize="xs"
            />
          )}
        </div>
        
        {companyData.mainActivity && (
          <DataField 
            label="Atividade Principal:" 
            value={`${companyData.mainActivity.id} | ${companyData.mainActivity.text}`} 
            textSize="xs"
          />
        )}
      </div>
    </SectionContainer>
  );
};

// Helper functions for formatting
const formatAddress = (address: CompanyData['address']) => {
  if (!address) return '-';
  
  const parts = [
    address.street,
    address.number ? `nº ${address.number}` : '',
    address.details,
    address.district ? `- ${address.district}` : '',
    address.city,
    address.state,
    address.zip
  ].filter(Boolean);
  
  return parts.join(', ');
};

const formatPhone = (phone: { area: string; number: string; type?: string }) => {
  if (!phone) return '-';
  return `(${phone.area}) ${phone.number}`;
};

export default CompanyInfoSection;
