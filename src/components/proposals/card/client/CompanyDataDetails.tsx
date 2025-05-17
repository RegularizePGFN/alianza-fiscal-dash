
import React from 'react';
import { Building2, Phone, Mail, Briefcase, Calendar, MapPin, Clock } from 'lucide-react';
import { CompanyData } from "@/lib/types/proposals";

interface CompanyDataDetailsProps {
  companyData: CompanyData;
}

const CompanyDataDetails = ({ companyData }: CompanyDataDetailsProps) => {
  const formatAddress = (address?: CompanyData['address']): string => {
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
    <div className="bg-slate-50 border border-af-blue-100 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center text-af-blue-700 font-medium mb-1">
            <Building2 className="h-4 w-4 mr-2" />
            Nome/Razão Social:
          </div>
          <p className="pl-6 mb-3">{companyData.company?.name || '-'}</p>
          
          {companyData.status && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Clock className="h-4 w-4 mr-2" />
                Situação:
              </div>
              <p className={`pl-6 mb-3 ${companyData.status.text === "Ativa" ? "text-green-600 font-medium" : "text-red-600"}`}>
                {companyData.status.text}
                {companyData.statusDate && ` desde ${new Date(companyData.statusDate).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
          )}
          
          {companyData.founded && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Data de Abertura:
              </div>
              <p className="pl-6 mb-3">
                {new Date(companyData.founded).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
          
          {companyData.company?.nature && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Natureza Jurídica:
              </div>
              <p className="pl-6 mb-3">
                {companyData.company.nature.text}
              </p>
            </div>
          )}
          
          {companyData.phones && companyData.phones.length > 0 && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Phone className="h-4 w-4 mr-2" />
                Telefone{companyData.phones.length > 1 ? 's' : ''}:
              </div>
              <ul className="pl-6 mb-3">
                {companyData.phones.map((phone, index) => (
                  <li key={index} className="text-base">
                    ({phone.area}) {phone.number} {phone.type ? `(${phone.type})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {companyData.emails && companyData.emails.length > 0 && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Mail className="h-4 w-4 mr-2" />
                Email{companyData.emails.length > 1 ? 's' : ''}:
              </div>
              <ul className="pl-6 mb-3">
                {companyData.emails.map((email, index) => (
                  <li key={index} className="text-base break-all">{email.address}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div>
          {companyData.address && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                Endereço:
              </div>
              <p className="pl-6 mb-3">{formatAddress(companyData.address)}</p>
            </div>
          )}
          
          {companyData.company?.size && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Porte:
              </div>
              <p className="pl-6 mb-3">
                {companyData.company.size.text} ({companyData.company.size.acronym})
              </p>
            </div>
          )}
          
          {companyData.company?.equity !== undefined && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Capital Social:
              </div>
              <p className="pl-6 mb-3">
                R$ {companyData.company.equity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          
          {companyData.mainActivity && (
            <div>
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Atividade Principal:
              </div>
              <p className="pl-6 mb-3">
                {companyData.mainActivity.id} | {companyData.mainActivity.text}
              </p>
            </div>
          )}
        </div>
      </div>

      <CompanySideActivities sideActivities={companyData.sideActivities} />
    </div>
  );
};

export default CompanyDataDetails;
