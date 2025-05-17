
import React from 'react';
import { Building2, Phone, Mail, Briefcase } from 'lucide-react';

interface CompanyInfo {
  name?: string;
  phones?: string[];
  emails?: string[];
  businessActivity?: string;
}

interface ClientManualInfoProps {
  companyInfo: CompanyInfo;
}

const ClientManualInfo = ({ companyInfo }: ClientManualInfoProps) => {
  if (!companyInfo || Object.keys(companyInfo).length === 0) return null;
  
  return (
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
  );
};

export default ClientManualInfo;
