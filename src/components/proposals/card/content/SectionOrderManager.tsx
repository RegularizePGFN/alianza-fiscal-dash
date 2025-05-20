
import React from 'react';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";

interface SectionOrderManagerProps {
  layout: {
    sections: string[];
    showHeader: boolean;
    showLogo: boolean;
    showWatermark: boolean;
  };
  companyData?: CompanyData | null;
  children: (sectionOrder: string[]) => React.ReactNode;
}

const SectionOrderManager = ({ layout, companyData, children }: SectionOrderManagerProps) => {
  // Make sure company data is shown first if available
  const sectionOrder = [...layout.sections];

  if (companyData && !sectionOrder.includes('company')) {
    // If there's company data but no company section, add it at the beginning
    sectionOrder.unshift('company');
  }
  
  // Remove client section if we have company data to prevent duplication
  if (companyData) {
    const clientIndex = sectionOrder.indexOf('client');
    if (clientIndex !== -1) {
      sectionOrder.splice(clientIndex, 1);
    }
  }

  return <>{children(sectionOrder)}</>;
};

export default SectionOrderManager;
