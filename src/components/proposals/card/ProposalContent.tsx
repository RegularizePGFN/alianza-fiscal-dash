
import React from 'react';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
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
import ExecutiveDataSection from './sections/ExecutiveDataSection';

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
      case 'executive':
        return <ExecutiveDataSection data={data} />;
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

  return (
    <div className={`p-4 space-y-0 font-['Roboto',sans-serif] ${className}`}>
      {/* Main content sections */}
      <div className="print:break-after-avoid">
        {/* Render initial sections based on the adjusted section order (except payment schedule) */}
        {filteredSections.filter(section => section !== 'paymentSchedule').map((section, index) => (
          <React.Fragment key={index}>
            {renderSection(section)}
          </React.Fragment>
        ))}
        
        {/* Always show comments here if they exist and aren't already in the sections */}
        {data.additionalComments && !renderedSections.has('comments') && 
          <CommentsSection data={data} colors={colors} />
        }
        
        {/* Always show fees section if not already rendered */}
        {!renderedSections.has('fees') && 
          <FeesSection data={data} colors={colors} />
        }
        
        {/* Always show executive data if enabled */}
        <ExecutiveDataSection data={data} />
      </div>
      
      {/* Payment Schedule section on its own page */}
      {filteredSections.includes('paymentSchedule') && renderSection('paymentSchedule')}
      
      {/* Signature is always shown */}
      <SignatureSection data={data} />
    </div>
  );
};

export default ProposalContent;
