
import React from 'react';
import { CompanyData } from "@/lib/types/proposals";

interface CompanyDataDetailsProps {
  companyData: CompanyData;
}

const CompanyDataDetails = ({ companyData }: CompanyDataDetailsProps) => {
  if (!companyData || !companyData.company) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-2">
      <div className="bg-slate-50 border border-af-blue-100 p-3 space-y-1">
        <div className="mb-1">
          <h4 className="font-medium text-af-blue-700 text-sm">
            {companyData.company.name}
          </h4>
          {companyData.alias && (
            <p className="text-xs text-gray-600">
              Nome Fantasia: {companyData.alias}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {companyData.founded && (
            <div>
              <span className="text-gray-600">Data de abertura:</span>
              <p>{formatDate(companyData.founded)}</p>
            </div>
          )}
          
          {companyData.status && (
            <div>
              <span className="text-gray-600">Situação:</span>
              <p>{companyData.status.text}</p>
            </div>
          )}
          
          {companyData.address && (
            <div className="col-span-2 mt-1">
              <span className="text-gray-600">Endereço:</span>
              <p>
                {[
                  companyData.address.street,
                  companyData.address.number,
                  companyData.address.details,
                ].filter(Boolean).join(', ')}
              </p>
              <p>
                {[
                  companyData.address.district,
                  companyData.address.city,
                  companyData.address.state,
                  companyData.address.zip,
                ].filter(Boolean).join(' - ')}
              </p>
            </div>
          )}
          
          {companyData.phones && companyData.phones.length > 0 && (
            <div className="mt-1">
              <span className="text-gray-600">Telefones:</span>
              <p>
                {companyData.phones.map((phone, index) => 
                  `${phone.area}${phone.number}`
                ).join(', ')}
              </p>
            </div>
          )}
          
          {companyData.emails && companyData.emails.length > 0 && (
            <div className="mt-1">
              <span className="text-gray-600">E-mails:</span>
              <p>{companyData.emails.map(email => email.address).join(', ')}</p>
            </div>
          )}
        </div>
        
        {companyData.mainActivity && (
          <div className="mt-2">
            <span className="text-gray-600">Atividade Principal:</span>
            <p className="text-xs mt-0.5">
              {companyData.mainActivity.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDataDetails;
