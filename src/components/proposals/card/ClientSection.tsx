
import React from 'react';
import { BriefcaseIcon, Building2, Phone, Mail, Search, Briefcase, Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { CompanyData } from "@/lib/types/proposals";

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
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
        <BriefcaseIcon className="mr-2 h-5 w-5 text-af-blue-600" />
        Dados do Contribuinte
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 border border-af-blue-100 p-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium text-af-blue-700">CNPJ:</span>
              <p className="text-lg">{cnpj || '-'}</p>
            </div>
            {!companyData && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onSearchCnpj} 
                disabled={isSearching || !cnpj}
                className="h-8 gap-1 print:hidden"
              >
                {isSearching ? 
                  <div className="animate-spin h-4 w-4 border-2 border-af-blue-700 border-t-transparent rounded-full"></div> : 
                  <Search className="h-4 w-4" />
                }
                Buscar
              </Button>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 border border-af-blue-100 p-4">
          <span className="font-medium text-af-blue-700">Número do Débito:</span>
          <p className="text-lg">{debtNumber || '-'}</p>
        </div>
      </div>
      
      {companyData && (
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
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
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
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
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
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
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
          
          {companyData.sideActivities && companyData.sideActivities.length > 0 && (
            <div className="mt-2 pt-2 border-t border-af-blue-100">
              <div className="flex items-center text-af-blue-700 font-medium mb-1">
                <Briefcase className="h-4 w-4 mr-2" />
                Atividades Secundárias:
              </div>
              <ul className="pl-6">
                {companyData.sideActivities.map((activity, index) => (
                  <li key={index} className="text-sm mb-1">• {activity.id} | {activity.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {businessActivity && !companyData && (
        <div className="bg-slate-50 border border-af-blue-100 p-4">
          <span className="font-medium text-af-blue-700 flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Ramo de Atividade:
          </span>
          <p className="text-base mt-1 pl-6">{businessActivity}</p>
        </div>
      )}
      
      {companyInfo && !companyData && (
        <div className="bg-slate-50 border border-af-blue-100 p-4 border-l-4 border-l-af-blue-600">
          <div className="space-y-3">
            {companyInfo.name && (
              <div>
                <div className="flex items-center text-af-blue-700 font-medium mb-1">
                  <Building2 className="h-4 w-4 mr-2" />
                  Nome da Empresa:
                </div>
                <p className="pl-6 font-semibold">{companyInfo.name}</p>
              </div>
            )}
            
            {companyInfo.phones && companyInfo.phones.length > 0 && (
              <div>
                <div className="flex items-center text-af-blue-700 font-medium mb-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Telefone{companyInfo.phones.length > 1 ? 's' : ''}:
                </div>
                <ul className="pl-6">
                  {companyInfo.phones.map((phone, index) => (
                    <li key={index} className="text-base">{phone}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {companyInfo.emails && companyInfo.emails.length > 0 && (
              <div>
                <div className="flex items-center text-af-blue-700 font-medium mb-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email{companyInfo.emails.length > 1 ? 's' : ''}:
                </div>
                <ul className="pl-6">
                  {companyInfo.emails.map((email, index) => (
                    <li key={index} className="text-base break-all">{email}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {companyInfo.businessActivity && (
              <div>
                <div className="flex items-center text-af-blue-700 font-medium mb-1">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Ramo de Atividade:
                </div>
                <p className="text-base pl-6">{companyInfo.businessActivity}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSection;
