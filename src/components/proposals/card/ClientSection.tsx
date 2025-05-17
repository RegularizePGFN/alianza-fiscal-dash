
import React from 'react';
import { BriefcaseIcon, Building2, Phone, Mail, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CompanyInfo {
  name?: string;
  phones?: string[];
  emails?: string[];
}

interface ClientSectionProps {
  cnpj: string;
  debtNumber: string;
  companyInfo?: CompanyInfo;
  onSearchCnpj: () => void;
  isSearching: boolean;
}

const ClientSection = ({ 
  cnpj, 
  debtNumber, 
  companyInfo, 
  onSearchCnpj,
  isSearching
}: ClientSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
        <BriefcaseIcon className="mr-2 h-5 w-5 text-af-blue-600" />
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 border border-af-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium text-af-blue-700">CNPJ:</span>
              <p className="text-lg">{cnpj || '-'}</p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onSearchCnpj} 
              disabled={isSearching || !cnpj}
              className="h-8 gap-1"
            >
              {isSearching ? 
                <div className="animate-spin h-4 w-4 border-2 border-af-blue-700 border-t-transparent rounded-full"></div> : 
                <Search className="h-4 w-4" />
              }
              Buscar
            </Button>
          </div>
        </div>
        <div className="bg-white p-4 border border-af-blue-100">
          <span className="font-medium text-af-blue-700">Número do Débito:</span>
          <p className="text-lg">{debtNumber || '-'}</p>
        </div>
        
        {companyInfo && (
          <div className="col-span-2 bg-white p-4 border border-af-blue-100 border-l-4 border-l-af-blue-600">
            <div className="space-y-3">
              {companyInfo.name && (
                <div>
                  <div className="flex items-center text-af-blue-700 font-medium mb-1">
                    <Building2 className="h-4 w-4 mr-2" />
                    Nome da Empresa:
                  </div>
                  <p className="text-lg font-semibold pl-6">{companyInfo.name}</p>
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
                      <li key={index} className="text-base">{email}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSection;
