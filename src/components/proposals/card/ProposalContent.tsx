
import React from 'react';
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
  FooterSection
} from './sections';

interface ProposalContentProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  className?: string;
  isPreview?: boolean;
}

const ProposalContent = ({ data, companyData, className = "", isPreview = false }: ProposalContentProps) => {
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
      sections: ['client', 'alert', 'debt', 'payment', 'fees', 'total'],
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
        return <TotalSection data={data} economyValue={economyValue} />;
      case 'comments':
        return <CommentsSection data={data} colors={colors} />;
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 space-y-0 font-['Roboto',sans-serif] ${className}`}>
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
      
      {/* Signature is always shown */}
      <SignatureSection data={data} />
      
      {/* No footer needed since signature is always shown */}
    </div>
  );
};

export default ProposalContent;
