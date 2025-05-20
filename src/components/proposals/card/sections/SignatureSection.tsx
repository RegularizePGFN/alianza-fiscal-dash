
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface SignatureSectionProps {
  data: Partial<ExtractedData>;
  className?: string;
}

const SignatureSection = ({ data, className = "" }: SignatureSectionProps) => {
  // Default role if not provided
  const specialistRole = data.specialistRole || "Especialista Tributário";
  // Only show email if available
  const hasEmail = data.specialistEmail && data.specialistEmail.trim() !== '';
  
  return (
    <div className={`mt-4 pt-2 text-sm text-center ${className}`}>
      <div className="flex flex-col items-center space-y-1">
        <p className="font-medium">{data.specialistName || "Especialista"}</p>
        <p className="text-xs text-gray-500">{specialistRole}</p>
        {hasEmail && (
          <p className="text-xs text-gray-500">{data.specialistEmail}</p>
        )}
      </div>
    </div>
  );
};

export default SignatureSection;
