
import React from 'react';
import { CompanyData } from "@/lib/types/proposals";
import { Phone, Mail, MapPin, Calendar, CheckCircle, Briefcase } from 'lucide-react';
import { SectionContainer, DataField } from './index';

interface CompanyInfoSectionProps {
  companyData?: CompanyData | null;
  colors: {
    secondary: string;
  };
  compact?: boolean;
}

const CompanyInfoSection = ({ companyData, colors, compact = false }: CompanyInfoSectionProps) => {
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
    <SectionContainer 
      title="Dados do Contribuinte" 
      color={colors.secondary} 
      compact={compact}
    >
      {/* CNPJ */}
      <DataField 
        label="CNPJ" 
        value={companyData.taxId || '-'}
        compact={compact} 
      />
      
      {/* Razão Social / Nome */}
      <DataField 
        label="Razão Social" 
        value={companyData.company.name || '-'} 
        fullWidth={true}
        compact={compact}
      />
      
      {/* Situação */}
      <DataField 
        label="Situação" 
        value={companyData.status?.text || '-'}
        icon={<CheckCircle />}
        compact={compact}
      />
      
      {/* Data de Abertura */}
      <DataField 
        label="Data de Abertura" 
        value={formatDate(companyData.founded) || '-'}
        icon={<Calendar />}
        compact={compact}
      />
      
      {/* Endereço */}
      <DataField 
        label="Endereço" 
        value={formatAddress(companyData.address) || '-'}
        icon={<MapPin />}
        fullWidth={true}
        compact={compact}
      />
      
      {/* Telefones */}
      {companyData.phones && companyData.phones.length > 0 && (
        <DataField 
          label="Telefone" 
          value={
            <>
              {companyData.phones.slice(0, 2).map((phone, index) => (
                <p key={index}>{phone.area}{phone.number}</p>
              ))}
            </>
          }
          icon={<Phone />}
          compact={compact}
        />
      )}
      
      {/* Emails */}
      {companyData.emails && companyData.emails.length > 0 && (
        <DataField 
          label="Email" 
          value={
            <>
              {companyData.emails.slice(0, 2).map((email, index) => (
                <p key={index} className="break-all">{email.address}</p>
              ))}
            </>
          }
          icon={<Mail />}
          compact={compact}
        />
      )}
      
      {/* Atividade Principal */}
      {companyData.mainActivity && (
        <DataField 
          label="Atividade Principal" 
          value={`${companyData.mainActivity.id} | ${companyData.mainActivity.text}`}
          icon={<Briefcase />}
          fullWidth={true}
          compact={compact}
        />
      )}
    </SectionContainer>
  );
};

export default CompanyInfoSection;
