
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
        {companyData.cnpj && (
          <DataField label="CNPJ:" value={companyData.cnpj} />
        )}
        
        {companyData.name && (
          <DataField 
            label="Razão Social:" 
            value={companyData.name} 
            textStyle="font-medium"
          />
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {companyData.situation && (
            <DataField label="Situação:" value={companyData.situation} />
          )}
          
          {companyData.openingDate && (
            <DataField label="Data de Abertura:" value={companyData.openingDate} />
          )}
        </div>
        
        {companyData.address && (
          <DataField 
            label="Endereço:" 
            value={companyData.address} 
            textSize="xs"
          />
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {companyData.phones && companyData.phones.length > 0 && (
            <DataField 
              label="Telefone:" 
              value={companyData.phones[0]} 
              textSize="xs"
            />
          )}
          
          {companyData.emails && companyData.emails.length > 0 && (
            <DataField 
              label="Email:" 
              value={companyData.emails[0]} 
              textSize="xs"
            />
          )}
        </div>
        
        {companyData.mainActivity && (
          <DataField 
            label="Atividade Principal:" 
            value={`${companyData.mainActivity.code} | ${companyData.mainActivity.description}`} 
            textSize="xs"
          />
        )}
      </div>
    </SectionContainer>
  );
};

export default CompanyInfoSection;
