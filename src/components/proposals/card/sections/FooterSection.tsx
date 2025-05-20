
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FooterSectionProps {
  data: Partial<ExtractedData>;
}

const FooterSection = ({ data }: FooterSectionProps) => {
  // Don't show the footer if signature is already shown to avoid duplication
  if (data.showSignature === "true") return null;
  
  // Get specialist name
  const specialistName = data.specialistName || 'Especialista';
  
  return (
    <div className="mt-4 text-center text-sm text-gray-500">
      <p>{specialistName} - Especialista Tributário</p>
    </div>
  );
};

export default FooterSection;
