
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface SignatureSectionProps {
  data: Partial<ExtractedData>;
  className?: string;
}

const SignatureSection = ({ data, className = "" }: SignatureSectionProps) => {
  return (
    <div className={`mt-4 pt-2 text-sm text-center ${className}`}>
      <div className="flex flex-col items-center space-y-1">
        <p className="font-medium">{data.specialistName || "Especialista"}</p>
        <p className="text-xs text-gray-500">{data.specialistRole || "Especialista Tributário"}</p>
        {data.specialistEmail && (
          <p className="text-xs text-gray-500">{data.specialistEmail}</p>
        )}
      </div>
    </div>
  );
};

export default SignatureSection;
