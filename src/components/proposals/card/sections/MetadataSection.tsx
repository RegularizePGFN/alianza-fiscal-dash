import React from 'react';
import { format, isValid, parseISO } from "date-fns";
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
  // Enhanced safe date formatting function to work with already formatted dates
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    
    try {
      // If the date is already in dd/MM/yyyy format, return it as is
      if (dateStr.includes('/') && dateStr.split('/').length === 3) {
        return dateStr;
      }
      
      // Otherwise try to parse and format it
      let dateObj;
      try {
        // Try to parse as ISO string first
        dateObj = parseISO(dateStr);
        
        // If the result is not valid, try as regular date
        if (!isValid(dateObj)) {
          dateObj = new Date(dateStr);
        }
        
        // Final validity check
        if (!isValid(dateObj)) {
          console.warn("Invalid date format:", dateStr);
          return dateStr; // Return original string if parsing fails
        }
        
        return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
      } catch (e) {
        console.error("Error formatting date:", e);
        return dateStr; // Return original string on error
      }
    } catch (e) {
      console.error("Error in formatDateTime:", e);
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
