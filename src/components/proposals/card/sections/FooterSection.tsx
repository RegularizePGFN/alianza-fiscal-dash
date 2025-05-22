
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FooterSectionProps {
  data: Partial<ExtractedData>;
}

const FooterSection = ({ data }: FooterSectionProps) => {
  return (
    <div className="bg-af-blue-700 h-2 w-full mt-auto print:fixed print:bottom-0"></div>
  );
};

export default FooterSection;
