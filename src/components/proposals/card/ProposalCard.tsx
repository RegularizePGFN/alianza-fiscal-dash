
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { HeaderSection } from './sections';
import ProposalContent from './ProposalContent';
import { ActionButtonsSection } from './sections';

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: CompanyData | null;
}

const ProposalCard = ({ data, companyData }: ProposalCardProps) => {
  // Get colors from template settings or use defaults
  const colors = (() => {
    try {
      return {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F8FAFC'
      };
    } catch (e) {
      return {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#10B981',
        background: '#F8FAFC'
      };
    }
  })();

  // Default layout settings
  const layout = {
    sections: ['client', 'alert', 'debt', 'payment', 'fees', 'total'],
    showHeader: true,
    showLogo: true,
    showWatermark: false
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Action buttons - agora acima do card da proposta */}
      <ActionButtonsSection 
        data={data}
        companyData={companyData}
      />

      {/* Main proposal card */}
      <Card 
        className="max-w-3xl mx-auto shadow border overflow-hidden font-['Roboto',sans-serif] w-full print:shadow-none print:border-0"
        style={{ 
          backgroundColor: colors.background,
          margin: 0,
          padding: 0
        }}
      >
        {/* Header with Logo */}
        <HeaderSection 
          showHeader={layout.showHeader} 
          showLogo={layout.showLogo}
          discountedValue={data.discountedValue || '0,00'}
          colors={colors}
          totalDebt={data.totalDebt}
        />

        <CardContent className="p-0">
          {/* Use the shared ProposalContent component */}
          <ProposalContent 
            data={data}
            companyData={companyData}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalCard;
