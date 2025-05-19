
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FooterSectionProps {
  data: Partial<ExtractedData>;
}

const FooterSection = ({ data }: FooterSectionProps) => {
  // Get specialist name
  const specialistName = data.specialistName || 'Especialista Tributário';
  
  return (
    <div className="mt-4 text-center text-sm text-gray-500">
      <p>Especialista Tributário: {specialistName}</p>
    </div>
  );
};

export default FooterSection;
