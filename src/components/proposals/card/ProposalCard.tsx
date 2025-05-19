
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { formatBrazilianCurrency } from '@/lib/utils';
import { 
  MetadataSection,
  ClientSection,
  CompanyInfoSection,
  AlertSection, 
  NegotiationSection,
  PaymentSection,
  FeesSection,
  TotalSection,
  CommentsSection,
  SignatureSection,
  FooterSection,
  HeaderSection,
  ActionButtons
} from './sections';

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: CompanyData | null;
}

const ProposalCard = ({ data, companyData }: ProposalCardProps) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  
  // Calculate the economy value
  const calculateEconomyValue = (): string => {
    if (!data.totalDebt || !data.discountedValue) return '0,00';
    
    try {
      const totalDebtValue = parseFloat(data.totalDebt.replace(/\./g, '').replace(',', '.'));
      const discountedVal = parseFloat(data.discountedValue.replace(/\./g, '').replace(',', '.'));
      
      if (isNaN(totalDebtValue) || isNaN(discountedVal)) return '0,00';
      
      const economyValue = totalDebtValue - discountedVal;
      return formatBrazilianCurrency(economyValue);
    } catch (e) {
      console.error('Error calculating economy value:', e);
      return '0,00';
    }
  };
  
  const economyValue = calculateEconomyValue();
  
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
      sections: ['client', 'alert', 'debt', 'payment', 'fees'],
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
  })();

  // Add "company" section to layout sections if not already there
  const layoutSections = layout?.sections || [];
  const sectionsToRender = [...layoutSections];
  if (companyData && !sectionsToRender.includes('company')) {
    // Add company after client section if it exists
    const clientIndex = sectionsToRender.indexOf('client');
    if (clientIndex !== -1) {
      sectionsToRender.splice(clientIndex + 1, 0, 'company');
    } else {
      sectionsToRender.unshift('company');
    }
  }

  // Map section IDs to their corresponding components
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'metadata':
        return <MetadataSection creationDate={data.creationDate} validityDate={data.validityDate} />;
      case 'client':
        return <ClientSection data={data} colors={colors} />;
      case 'company':
        return companyData ? <CompanyInfoSection companyData={companyData} colors={colors} /> : null;
      case 'alert':
        return <AlertSection />;
      case 'debt':
        return <NegotiationSection data={data} colors={colors} />;
      case 'payment':
        return <PaymentSection data={data} colors={colors} />;
      case 'fees':
        return <FeesSection data={data} colors={colors} />;
      case 'total':
        return <TotalSection data={data} />;
      case 'comments':
        return <CommentsSection data={data} colors={colors} />;
      default:
        return null;
    }
  };

  return (
    <Card ref={proposalRef} className="max-w-3xl mx-auto shadow border overflow-hidden font-['Roboto',sans-serif]"
          style={{ backgroundColor: colors.background }}>
      
      {/* Header with Logo */}
      <HeaderSection 
        showHeader={layout?.showHeader ?? true} 
        showLogo={layout?.showLogo ?? true}
        discountedValue={data.discountedValue || '0,00'}
        colors={colors}
        economyValue={economyValue}
        totalDebt={data.totalDebt}
      />

      <CardContent className="p-6 space-y-0">
        {/* Render all sections based on the layout configuration */}
        {sectionsToRender.map((section, index) => (
          <React.Fragment key={index}>
            {renderSection(section)}
          </React.Fragment>
        ))}
        
        {/* Always show comments at the end if they exist, regardless of layout */}
        {data.additionalComments && !sectionsToRender.includes('comments') && 
          <CommentsSection data={data} colors={colors} />
        }
        
        {/* Signature Section */}
        <SignatureSection data={data} />
        
        {/* Footer with Specialist Name */}
        <FooterSection data={data} />

        {/* Action Buttons */}
        <ActionButtons proposalRef={proposalRef} data={data} />
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
