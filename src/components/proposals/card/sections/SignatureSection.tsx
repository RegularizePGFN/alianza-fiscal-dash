
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface SignatureSectionProps {
  data: Partial<ExtractedData>;
}

const SignatureSection = ({ data }: SignatureSectionProps) => {
  return (
    <div className="mt-3 border-t pt-2">
      <p className="text-center text-xs">{data.sellerName || 'Especialista Tributário'}</p>
      <p className="text-center text-[10px] text-gray-600">Especialista Tributário</p>
      <p className="text-center text-[10px] text-gray-600 mt-0.5">{data.sellerEmail || ''}</p>
    </div>
  );
};

export default SignatureSection;
