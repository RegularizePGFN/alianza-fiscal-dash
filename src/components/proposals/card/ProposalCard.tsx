
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { HeaderSection } from './sections';
import ProposalContent from './ProposalContent';
import { useToast } from "@/hooks/use-toast";
import { generateProposalPdf, generateProposalPng } from "@/lib/pdfUtils";
import ActionButtons from './ActionButtons';

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: CompanyData | null;
  proposalRef?: React.RefObject<HTMLDivElement>;
}

const ProposalCard = ({ data, companyData, proposalRef: externalRef }: ProposalCardProps) => {
  // Use the external ref if provided, otherwise create a local one
  const localRef = React.useRef<HTMLDivElement>(null);
  const proposalRef = externalRef || localRef;
  
  const { toast } = useToast();
  
  // Effect to verify when fonts are loaded
  React.useEffect(() => {
    document.fonts.ready.then(() => {
      console.log('All fonts loaded for proposal rendering');
    });
  }, []);
  
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main proposal card with correct ref for PNG generation */}
      <Card ref={proposalRef} className="max-w-3xl mx-auto shadow border overflow-hidden font-['Roboto',sans-serif] w-full print:shadow-none"
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
        </CardContent>
        
        {/* Action buttons INSIDE the card to ensure proper PNG capture */}
        <ActionButtons
          onPrint={handlePrint}
          proposalData={data}
          proposalRef={proposalRef}
        />
      </Card>
    </div>
  );
};

export default ProposalCard;
