
import React from 'react';
import { CompanyData } from '@/lib/types/proposals';

interface CompanyDetailsPanelProps {
  companyData: CompanyData | null;
}

const CompanyDetailsPanel = ({ companyData }: CompanyDetailsPanelProps) => {
  if (!companyData) return null;

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
    <div className="bg-slate-50 border border-slate-200 p-4 rounded">
      <h3 className="font-medium text-base mb-3 text-af-blue-800 border-b pb-2">Dados do CNPJ</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-af-blue-700">CNPJ:</p>
          <p>{companyData.taxId}</p>
        </div>
        
        <div>
          <p className="font-medium text-af-blue-700">Nome/Razão Social:</p>
          <p>{companyData.company?.name}</p>
        </div>
        
        {companyData.status && (
          <div>
            <p className="font-medium text-af-blue-700">Situação:</p>
            <p className={`${companyData.status.text === "Ativa" ? "text-green-600 font-medium" : "text-red-600"}`}>
              {companyData.status.text}
            </p>
          </div>
        )}
        
        {companyData.founded && (
          <div>
            <p className="font-medium text-af-blue-700">Data de Abertura:</p>
            <p>{new Date(companyData.founded).toLocaleDateString('pt-BR')}</p>
          </div>
        )}
        
        {companyData.company?.nature && (
          <div>
            <p className="font-medium text-af-blue-700">Natureza Jurídica:</p>
            <p>{companyData.company.nature.text}</p>
          </div>
        )}
        
        {companyData.company?.size && (
          <div>
            <p className="font-medium text-af-blue-700">Porte:</p>
            <p>{companyData.company.size.text} ({companyData.company.size.acronym})</p>
          </div>
        )}
        
        {companyData.company?.equity !== undefined && (
          <div>
            <p className="font-medium text-af-blue-700">Capital Social:</p>
            <p>R$ {companyData.company.equity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        )}
        
        {companyData.address && (
          <div className="col-span-2">
            <p className="font-medium text-af-blue-700">Endereço:</p>
            <p>{formatAddress(companyData.address)}</p>
          </div>
        )}
        
        {companyData.phones && companyData.phones.length > 0 && (
          <div>
            <p className="font-medium text-af-blue-700">Telefones:</p>
            <ul>
              {companyData.phones.map((phone, idx) => (
                <li key={idx}>({phone.area}) {phone.number} {phone.type ? `(${phone.type})` : ''}</li>
              ))}
            </ul>
          </div>
        )}
        
        {companyData.emails && companyData.emails.length > 0 && (
          <div>
            <p className="font-medium text-af-blue-700">Emails:</p>
            <ul>
              {companyData.emails.map((email, idx) => (
                <li key={idx}>{email.address}</li>
              ))}
            </ul>
          </div>
        )}
        
        {companyData.mainActivity && (
          <div className="col-span-2">
            <p className="font-medium text-af-blue-700">Atividade Principal:</p>
            <p>{companyData.mainActivity.id} | {companyData.mainActivity.text}</p>
          </div>
        )}
        
        {companyData.sideActivities && companyData.sideActivities.length > 0 && (
          <div className="col-span-2">
            <p className="font-medium text-af-blue-700">Atividades Secundárias:</p>
            <ul className="list-disc pl-5">
              {companyData.sideActivities.map((activity, idx) => (
                <li key={idx}>{activity.id} | {activity.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetailsPanel;
