
import React from 'react';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { 
  LayoutParser,
  PageCalculator,
  MainPageContent,
  SchedulePageContent
} from './components';

interface ProposalContentProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  className?: string;
  isPreview?: boolean;
  currentPage?: number;
}

/**
 * Main component for rendering proposal content
 * Handles page management and content rendering
 */
const ProposalContent = ({ 
  data, 
  companyData, 
  className = "", 
  isPreview = false, 
  currentPage = 0 
}: ProposalContentProps) => {
  // Parse layout and color settings
  const { colors, layout } = LayoutParser({ data });
  
  // Calculate the total number of pages
  const { totalPages } = PageCalculator({ data });

  // Page 0 is the main content, page 1+ is the payment schedule
  if (currentPage === 0) {
    return (
      <div className={`p-3 space-y-2 h-full font-['Roboto',sans-serif] ${className}`}>
        <MainPageContent 
          data={data}
          companyData={companyData}
          colors={colors}
          layout={layout}
          totalPages={totalPages}
        />
      </div>
    );
  } else {
    // Payment schedule page (page 1+)
    return (
      <div className={`p-3 space-y-2 h-full font-['Roboto',sans-serif] ${className}`}>
        <SchedulePageContent 
          data={data}
          colors={colors}
          totalPages={totalPages}
        />
      </div>
    );
  }
};

export default ProposalContent;
