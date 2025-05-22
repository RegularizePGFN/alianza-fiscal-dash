
import React from 'react';
import { ExtractedData } from "@/lib/types/proposals";

interface FooterSectionProps {
  data: Partial<ExtractedData>;
}

const FooterSection = ({ data }: FooterSectionProps) => {
  return (
    <div className="w-full rounded-b-none bg-af-blue-700 text-white h-2 print:fixed print:bottom-0 print:left-0 print:right-0">
      {/* Este é apenas uma barra azul fina no rodapé da proposta */}
    </div>
  );
};

export default FooterSection;
