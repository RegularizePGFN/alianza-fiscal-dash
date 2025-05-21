
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
  paginationMode?: 'single-page' | 'first-page' | 'additional-page';
  pageNumber?: number;
}

const ProposalContent = ({ 
  data, 
  companyData, 
  className = "", 
  isPreview = false,
  paginationMode = 'single-page',
  pageNumber = 1
}: ProposalContentProps) => {
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

  // Map section IDs to their corresponding components
  const renderSection = (sectionId: string) => {
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
      case 'alert':
        return null; // Removed alert section
      case 'debt':
        return <NegotiationSection data={data} colors={colors} />;
      case 'payment':
        return <PaymentSection data={data} colors={colors} />;
      case 'paymentSchedule':
        return <div data-section="payment-schedule" className="print:break-before-page"><PaymentScheduleSection data={data} colors={colors} /></div>;
      case 'fees':
        return <FeesSection data={data} colors={colors} />;
      case 'total':
        return null; // Removed total section
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

  // Remove 'total' and 'alert' from the sections array
  const filteredSections = sectionOrder.filter(section => section !== 'total' && section !== 'alert');
  
  // Add paymentSchedule section once after payment if needed and not already present
  if (!filteredSections.includes('paymentSchedule') && filteredSections.includes('payment')) {
    const paymentIndex = filteredSections.indexOf('payment');
    if (paymentIndex !== -1) {
      filteredSections.splice(paymentIndex + 1, 0, 'paymentSchedule');
    }
  }

  // Determine which sections to render based on pagination mode
  const getPageSections = () => {
    if (paginationMode === 'single-page') {
      // Render all sections for single page mode
      return filteredSections;
    } else if (paginationMode === 'first-page') {
      // For first page, show the first 3 sections (or half if fewer)
      const firstPageCount = Math.min(3, Math.ceil(filteredSections.length / 2));
      return filteredSections.slice(0, firstPageCount);
    } else if (paginationMode === 'additional-page') {
      // For additional pages, determine which sections to show based on page number
      const firstPageCount = Math.min(3, Math.ceil(filteredSections.length / 2));
      
      if (pageNumber === 2) {
        // Second page gets next set of sections
        const remainingSections = filteredSections.slice(firstPageCount);
        return remainingSections.filter(section => section !== 'paymentSchedule');
      } else if (pageNumber === 3) {
        // Third page gets payment schedule if present
        return filteredSections.filter(section => section === 'paymentSchedule');
      }
      
      return [];
    }
    
    return filteredSections;
  };
  
  const pageSections = getPageSections();

  return (
    <div className={`p-4 space-y-0 font-['Roboto',sans-serif] ${className}`}>
      {/* Main content sections */}
      <div className="print:break-after-avoid">
        {/* Render sections based on pagination mode */}
        {pageSections.map((section, index) => (
          <React.Fragment key={index}>
            {renderSection(section)}
          </React.Fragment>
        ))}
        
        {/* Show comments on first page if they exist and aren't already in the sections */}
        {(paginationMode === 'single-page' || paginationMode === 'first-page') && 
         data.additionalComments && !renderedSections.has('comments') && 
          <CommentsSection data={data} colors={colors} />
        }
      </div>
      
      {/* Signature is shown on the last page or single page */}
      {(paginationMode === 'single-page' || 
        (paginationMode === 'additional-page' && pageNumber === Math.min(3, Math.ceil(filteredSections.length / 2) + 1))) && 
        <SignatureSection data={data} />
      }
    </div>
  );
};

export default ProposalContent;
