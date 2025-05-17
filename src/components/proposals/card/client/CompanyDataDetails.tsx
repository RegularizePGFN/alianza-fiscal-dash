
import React from 'react';
import { CompanyData } from "@/lib/types/proposals";
import { CompanySideActivities } from './';

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
    <div className="space-y-4">
      <div className="bg-slate-50 border border-af-blue-100 p-4 space-y-1">
        <div className="mb-2">
          <h4 className="font-medium text-af-blue-700">
            {companyData.company.name}
          </h4>
          {companyData.alias && (
            <p className="text-sm text-gray-600">
              Nome Fantasia: {companyData.alias}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
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
            <div className="col-span-2 mt-2">
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
            <div className="mt-2">
              <span className="text-gray-600">Telefones:</span>
              <ul>
                {companyData.phones.map((phone, index) => (
                  <li key={index}>
                    ({phone.area}) {phone.number}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {companyData.emails && companyData.emails.length > 0 && (
            <div className="mt-2">
              <span className="text-gray-600">E-mails:</span>
              <ul>
                {companyData.emails.map((email, index) => (
                  <li key={index}>{email.address}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {companyData.mainActivity && (
          <div className="mt-4">
            <span className="font-medium text-af-blue-700">Atividade Principal:</span>
            <p className="text-sm mt-1">
              {companyData.mainActivity.id} | {companyData.mainActivity.text}
            </p>
            
            {companyData.sideActivities && companyData.sideActivities.length > 0 && (
              <CompanySideActivities sideActivities={companyData.sideActivities} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDataDetails;
