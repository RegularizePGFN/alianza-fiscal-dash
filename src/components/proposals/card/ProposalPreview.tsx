
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { HeaderSection } from './sections';
import PaginatedProposalView from './PaginatedProposalView';

interface ProposalPreviewProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

const ProposalPreview = ({ data, companyData }: ProposalPreviewProps) => {
  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card 
      className="mx-auto shadow border overflow-hidden font-['Roboto',sans-serif] w-full print:shadow-none print:border-0"
      style={{ 
        margin: 0,
        padding: 0
      }}
    >
      <CardContent className="p-0">
        {/* Use the new paginated proposal view */}
        <PaginatedProposalView 
          data={data}
          companyData={companyData}
          onPrint={handlePrint}
        />
      </CardContent>
    </Card>
  );
};

export default ProposalPreview;
