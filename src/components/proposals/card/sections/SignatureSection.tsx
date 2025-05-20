
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface SignatureSectionProps {
  data: Partial<ExtractedData>;
}

const SignatureSection = ({ data }: SignatureSectionProps) => {
  // Get specialist name
  const specialistName = data.specialistName || 'Especialista';
  
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="flex flex-col items-center">
        <div className="w-48 border-b border-gray-300 pb-1 mb-2"></div>
        <p className="text-sm font-medium text-gray-700">
          {specialistName}
        </p>
        <p className="text-sm text-gray-500">Especialista Tributário</p>
      </div>
    </div>
  );
};

export default SignatureSection;
