
import React from 'react';
import { Card } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { ActionButtonsSection } from './sections';
import PaginatedProposalView from './PaginatedProposalView';

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: CompanyData | null;
}

const ProposalCard = ({ data, companyData }: ProposalCardProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Action buttons - acima do card da proposta */}
      <ActionButtonsSection 
        data={data}
        companyData={companyData}
      />

      {/* Main proposal card */}
      <Card 
        className="max-w-3xl mx-auto shadow border overflow-hidden font-['Roboto',sans-serif] w-full print:shadow-none print:border-0"
      >
        {/* Use the paginated proposal view */}
        <PaginatedProposalView 
          data={data}
          companyData={companyData}
        />
      </Card>
    </div>
  );
};

export default ProposalCard;
