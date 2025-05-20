
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

  // Get layout settings or use defaults without self-referencing
  const layoutData = (() => {
    if (data.templateLayout && typeof data.templateLayout === 'string') {
      try {
        return JSON.parse(data.templateLayout);
      } catch (e) {}
    }
    return null;
  })();

  // Parse layout settings or use defaults
  const layout = {
    sections: layoutData?.sections || ['client', 'alert', 'debt', 'payment', 'fees', 'total'],
    showHeader: layoutData?.showHeader !== undefined ? layoutData.showHeader : true,
    showLogo: layoutData?.showLogo !== undefined ? layoutData.showLogo : true,
    showWatermark: layoutData?.showWatermark || false
  };

  // Define sections to render - don't duplicate client/company sections
  const sectionsToRender = [...(layout?.sections || [])];
  
  // If companyData exists, replace 'client' with 'company' if client exists
  if (companyData) {
    const clientIndex = sectionsToRender.indexOf('client');
    if (clientIndex !== -1) {
      // Replace 'client' with 'company' 
      sectionsToRender.splice(clientIndex, 1, 'company');
    } else if (!sectionsToRender.includes('company')) {
      // If client doesn't exist and company isn't already in the list, add company
      sectionsToRender.unshift('company');
    }
  }

  // Prepare complete companyInfo for ClientSection with email and phone
  const companyInfo = {
    name: data.clientName,
    phones: data.clientPhone ? [data.clientPhone] : [],
    emails: data.clientEmail ? [data.clientEmail] : [],
    businessActivity: data.businessActivity
  };

  // Map section IDs to their corresponding components
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'metadata':
        return <MetadataSection creationDate={data.creationDate} validityDate={data.validityDate} />;
      case 'client':
        // Only show client section if there's no company data (fallback)
        return !companyData ? (
          <ClientSection 
            data={data} 
            colors={colors} 
            companyInfo={companyInfo}
          />
        ) : null;
      case 'company':
        return companyData ? (
          <CompanyInfoSection companyData={companyData} colors={colors} />
        ) : null;
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
      {/* Render sections based on the layout configuration */}
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
    </div>
  );
};

export default ProposalContent;
