
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface SignatureSectionProps {
  data: Partial<ExtractedData>;
  compact?: boolean;
}

const SignatureSection = ({ data, compact = false }: SignatureSectionProps) => {
  // Get seller name or use a default
  const sellerName = data.sellerName || 'Nome do Especialista';
  const sellerPhone = data.sellerPhone || '';
  const sellerEmail = data.sellerEmail || '';
  
  return (
    <div className={compact ? "mt-4 border-t border-gray-200 pt-3" : "mt-8 border-t border-gray-200 pt-6"}>
      <div className="flex flex-col items-center">
        <div className="w-48 border-b border-gray-300 pb-1 mb-2"></div>
        <p className={`font-medium text-gray-700 ${compact ? "text-xs" : "text-sm"}`}>
          {sellerName}
        </p>
        <p className={`text-gray-500 ${compact ? "text-xs" : "text-sm"}`}>Especialista Tributário</p>
        
        {(sellerPhone || sellerEmail) && (
          <div className={`text-gray-500 mt-1 text-center ${compact ? "text-[10px]" : "text-xs"}`}>
            {sellerPhone && <p>{sellerPhone}</p>}
            {sellerEmail && <p>{sellerEmail}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureSection;
