
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";
import { Phone, Mail } from 'lucide-react';

interface CompanyInfo {
  name?: string;
  phones?: string[];
  emails?: string[];
  businessActivity?: string;
}

interface ClientSectionProps {
  data: Partial<ExtractedData>;
  colors: {
    secondary: string;
  };
  companyInfo?: CompanyInfo;
}

const ClientSection = ({ data, colors, companyInfo }: ClientSectionProps) => {
  // Get client name from data, not from user
  const clientName = data.clientName;
  
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold pb-2 mb-3 border-b border-gray-200" 
          style={{ color: colors.secondary }}>
        Dados do Contribuinte
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">CNPJ:</span>
          <p className="text-base mt-1">{data.cnpj || '-'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium text-gray-500">Número do Débito:</span>
          <p className="text-base mt-1">{data.debtNumber || '-'}</p>
        </div>
        {clientName && (
          <div className="bg-gray-50 p-3 rounded col-span-2">
            <span className="text-sm font-medium text-gray-500">Razão Social:</span>
            <p className="text-base mt-1">{clientName}</p>
          </div>
        )}
        
        {/* Display phone if available from data */}
        {data.clientPhone && (
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm font-medium text-gray-500 flex items-center">
              <Phone className="h-3 w-3 mr-1" /> Telefone:
            </span>
            <p className="text-base mt-1">{data.clientPhone}</p>
          </div>
        )}
        
        {/* Display email if available from data */}
        {data.clientEmail && (
          <div className="bg-gray-50 p-3 rounded">
            <span className="text-sm font-medium text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" /> Email:
            </span>
            <p className="text-base mt-1 break-all">{data.clientEmail}</p>
          </div>
        )}
        
        {/* Display business activity if available */}
        {data.businessActivity && (
          <div className="bg-gray-50 p-3 rounded col-span-2">
            <span className="text-sm font-medium text-gray-500">Ramo de Atividade:</span>
            <p className="text-base mt-1">{data.businessActivity}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSection;
