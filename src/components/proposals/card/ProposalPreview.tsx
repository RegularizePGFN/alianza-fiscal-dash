
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { HeaderSection } from './sections';
import ProposalContent from './ProposalContent';
import FooterSection from './sections/FooterSection';

interface ProposalPreviewProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

const ProposalPreview = ({ data, companyData }: ProposalPreviewProps) => {
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

  return (
    <Card 
      className="mx-auto shadow border overflow-hidden font-['Roboto',sans-serif] w-full print:shadow-none print:border-0 relative"
      style={{ 
        backgroundColor: colors.background,
        margin: 0,
        padding: 0,
        minHeight: '100vh'
      }}
    >
      {/* Header with Logo */}
      <HeaderSection 
        showHeader={true} 
        showLogo={true}
        discountedValue={data.discountedValue || '0,00'}
        colors={colors}
        totalDebt={data.totalDebt}
      />

      <CardContent className="p-0 pb-8">
        {/* Use the shared ProposalContent component */}
        <ProposalContent 
          data={data}
          companyData={companyData}
        />
      </CardContent>
      
      {/* Footer bar - posicionada no final da página */}
      <FooterSection data={data} />
    </Card>
  );
};

export default ProposalPreview;
