
import React from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MetadataSectionProps {
  creationDate?: string;
  validityDate?: string;
  specialistName?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
}

const MetadataSection = ({ 
  creationDate, 
  validityDate,
  specialistName,
  sellerName,
  sellerPhone,
  sellerEmail
}: MetadataSectionProps) => {
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  };
  
  return (
    <div className="flex justify-between items-center text-gray-600 text-sm mb-6">
      <div>
        <span>Data: {formatDateTime(creationDate)}</span>
      </div>
      <div>
        <span>Validade: {formatDateTime(validityDate)}</span>
      </div>
    </div>
  );
};

export default MetadataSection;
