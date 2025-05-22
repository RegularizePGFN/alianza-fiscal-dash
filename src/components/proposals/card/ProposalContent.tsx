
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
  CommentsSection,
  SignatureSection,
  FooterSection,
  PaymentScheduleSection
} from './sections';

interface ProposalContentProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  className?: string;
  isPreview?: boolean;
}

const ProposalContent = ({ data, companyData, className = "", isPreview = false }: ProposalContentProps) => {
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
    sections: layoutData?.sections || ['company', 'debt', 'payment', 'fees'],
    showHeader: layoutData?.showHeader !== undefined ? layoutData.showHeader : true,
    showLogo: layoutData?.showLogo !== undefined ? layoutData.showLogo : true,
    showWatermark: layoutData?.showWatermark || false
  };

  // We'll use a set to track which sections we've rendered to avoid duplicates
  const renderedSections = new Set();

  // Map section IDs to their corresponding components for the first page
  const renderMainSection = (sectionId: string) => {
    // If we've already rendered this section, don't render it again
    if (renderedSections.has(sectionId)) return null;
    
    // Mark this section as rendered
    renderedSections.add(sectionId);
    
    switch (sectionId) {
      case 'metadata':
        return <MetadataSection creationDate={data.creationDate} validityDate={data.validityDate} />;
      case 'client':
        // Only show client section if there's no company data (fallback)
        return !companyData ? (
          <ClientSection 
            data={data} 
            colors={colors} 
            companyInfo={{
              name: data.clientName,
              phones: data.clientPhone ? [data.clientPhone] : [],
              emails: data.clientEmail ? [data.clientEmail] : [],
              businessActivity: data.businessActivity
            }}
          />
        ) : null;
      case 'company':
        return companyData ? (
          <CompanyInfoSection companyData={companyData} colors={colors} />
        ) : null;
      case 'debt':
        return <NegotiationSection data={data} colors={colors} />;
      case 'payment':
        return <PaymentSection data={data} colors={colors} />;
      case 'fees':
        return <FeesSection data={data} colors={colors} />;
      case 'comments':
        return <CommentsSection data={data} colors={colors} />;
      default:
        return null;
    }
  };

  // Make sure company data is shown first if available
  const sectionOrder = [...layout.sections];
  if (companyData && !sectionOrder.includes('company')) {
    // If there's company data but no company section, add it at the beginning
    sectionOrder.unshift('company');
  }
  
  // Remove client section if we have company data to prevent duplication
  if (companyData) {
    const clientIndex = sectionOrder.indexOf('client');
    if (clientIndex !== -1) {
      sectionOrder.splice(clientIndex, 1);
    }
  }

  // Remove 'alert' section
  const filteredSections = sectionOrder.filter(section => section !== 'alert');

  return (
    <div className={`p-6 space-y-0 font-['Roboto',sans-serif] ${className}`}>
      {/* Main content for page 1 */}
      <div className="main-content">
        {/* Render main sections based on the adjusted section order */}
        {filteredSections.map((section, index) => (
          <React.Fragment key={index}>
            {renderMainSection(section)}
          </React.Fragment>
        ))}
        
        {/* Always show comments at the end of the main content if they exist */}
        {data.additionalComments && !renderedSections.has('comments') && 
          <CommentsSection data={data} colors={colors} />
        }
        
        {/* Signature is always shown on the main page */}
        <SignatureSection data={data} />
      </div>
      
      {/* Payment schedule on a separate page */}
      <PaymentScheduleSection data={data} colors={colors} />
    </div>
  );
};

export default ProposalContent;
