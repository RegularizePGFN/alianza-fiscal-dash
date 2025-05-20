
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
  const layoutData = (() => {
    if (data.templateLayout && typeof data.templateLayout === 'string') {
      try {
        return JSON.parse(data.templateLayout);
      } catch (e) {}
    }
    return null;
  })();

  // Parse layout settings or use defaults without self-referencing
  const layout = {
    sections: layoutData?.sections || ['client', 'alert', 'debt', 'payment', 'fees', 'total'],
    showHeader: layoutData?.showHeader !== undefined ? layoutData.showHeader : true,
    showLogo: layoutData?.showLogo !== undefined ? layoutData.showLogo : true,
    showWatermark: layoutData?.showWatermark || false
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card ref={proposalRef} className="max-w-3xl mx-auto shadow border overflow-hidden font-['Roboto',sans-serif]"
          style={{ backgroundColor: colors.background }}>
      
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
        
        {/* Action Buttons */}
        <ActionButtons 
          onPrint={handlePrint} 
          proposalData={data} 
          proposalRef={proposalRef} 
        />
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
