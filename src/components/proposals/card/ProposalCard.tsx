
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { HeaderSection, ActionButtons } from './sections';
import ProposalContent from './ProposalContent';

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: CompanyData | null;
}

const ProposalCard = ({ data, companyData }: ProposalCardProps) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  
  // Get colors from template settings or use defaults
  const colors = (() => {
    if (data.templateColors && typeof data.templateColors === 'string') {
      try {
        return JSON.parse(data.templateColors);
      } catch (e) {}
    }
    return {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      background: '#F8FAFC'
    };
  })();

  // Get layout settings or use defaults
  const layout = (() => {
    if (data.templateLayout && typeof data.templateLayout === 'string') {
      try {
        return JSON.parse(data.templateLayout);
      } catch (e) {}
    }
    return {
      sections: ['client', 'alert', 'debt', 'payment', 'fees', 'total'],
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
  })();

  return (
    <Card ref={proposalRef} className="max-w-3xl mx-auto shadow border overflow-hidden font-['Roboto',sans-serif]"
          style={{ backgroundColor: colors.background }}>
      
      {/* Header with Logo */}
      <HeaderSection 
        showHeader={layout?.showHeader ?? true} 
        showLogo={layout?.showLogo ?? true}
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
        
        {/* Action Buttons */}
        <ActionButtons proposalRef={proposalRef} data={data} />
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
