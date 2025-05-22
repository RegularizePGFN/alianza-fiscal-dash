
import React from 'react';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { 
  MetadataSection,
  ClientSection,
  CompanyInfoSection,
  NegotiationSection,
  PaymentSection,
  FeesSection,
  CommentsSection,
  SignatureSection,
  HeaderSection
} from '../sections';

interface MainPageContentProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  colors: any;
  layout: {
    sections: string[];
    showHeader: boolean;
    showLogo: boolean;
  };
  totalPages: number;
}

/**
 * Renders the content for the main page of the proposal (page 0)
 */
const MainPageContent = ({ 
  data, 
  companyData, 
  colors, 
  layout,
  totalPages
}: MainPageContentProps) => {
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
        return <MetadataSection key={sectionId} creationDate={data.creationDate} validityDate={data.validityDate} />;
      case 'client':
        // Only show client section if there's no company data (fallback)
        return !companyData ? (
          <ClientSection 
            key={sectionId}
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
          <CompanyInfoSection key={sectionId} companyData={companyData} colors={colors} />
        ) : null;
      case 'debt':
        return <NegotiationSection key={sectionId} data={data} colors={colors} />;
      case 'payment':
        return <PaymentSection key={sectionId} data={data} colors={colors} />;
      case 'fees':
        return <FeesSection key={sectionId} data={data} colors={colors} />;
      case 'comments':
        return <CommentsSection key={sectionId} data={data} colors={colors} />;
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
  
  // Ensure 'fees' section is included if we have fees data
  if (data.feesValue && !filteredSections.includes('fees')) {
    filteredSections.push('fees');
  }

  return (
    <>
      {/* Show header on first page if enabled */}
      {layout.showHeader && (
        <HeaderSection 
          showHeader={layout.showHeader} 
          showLogo={layout.showLogo}
          discountedValue={data.discountedValue || '0,00'}
          colors={colors}
          totalDebt={data.totalDebt}
        />
      )}

      {/* Main content for page 1 - reduced vertical spacing */}
      <div className="main-content space-y-2 px-3 py-2">
        {/* Render main sections based on the adjusted section order */}
        {filteredSections.map((section, index) => (
          <React.Fragment key={index}>
            {renderMainSection(section)}
          </React.Fragment>
        ))}
        
        {/* Always show comments at the end of the main content if they exist and weren't already included */}
        {data.additionalComments && !renderedSections.has('comments') && 
          <CommentsSection data={data} colors={colors} />
        }
        
        {/* Always show fees section if it has data and wasn't already included */}
        {data.feesValue && !renderedSections.has('fees') && 
          <FeesSection data={data} colors={colors} />
        }
        
        {/* Signature is always shown on the main page */}
        <SignatureSection data={data} />
      </div>
      
      <div className="text-right pr-4 pb-2 text-[10px] text-gray-500">
        Página 1 de {totalPages}
      </div>
    </>
  );
};

export default MainPageContent;
