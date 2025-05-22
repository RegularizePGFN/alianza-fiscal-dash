
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
    sections: layoutData?.sections || ['company', 'debt', 'payment', 'fees', 'paymentSchedule'],
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
        return <PaymentScheduleSection data={data} colors={colors} />;
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
  
  // Make sure paymentSchedule is included in the sections if not already present
  if (!filteredSections.includes('paymentSchedule')) {
    // Add paymentSchedule after payment section
    const paymentIndex = filteredSections.indexOf('payment');
    if (paymentIndex !== -1) {
      filteredSections.splice(paymentIndex + 1, 0, 'paymentSchedule');
    } else {
      // If payment section doesn't exist, add paymentSchedule at the end
      filteredSections.push('paymentSchedule');
    }
  }

  return (
    <div className={`p-4 space-y-6 font-['Roboto',sans-serif] ${className}`}>
      {/* Main content sections */}
      <div className="space-y-6">
        {/* Render all sections except payment schedule */}
        {filteredSections.filter(section => section !== 'paymentSchedule').map((section, index) => (
          <React.Fragment key={index}>
            {renderSection(section)}
          </React.Fragment>
        ))}
        
        {/* Always show comments here if they exist and aren't already in the sections */}
        {data.additionalComments && !renderedSections.has('comments') && 
          <CommentsSection data={data} colors={colors} />
        }
      </div>
      
      {/* Payment Schedule section on its own page for PDF */}
      <div className="page-break-before">
        {renderSection('paymentSchedule')}
      </div>
      
      {/* Signature is always shown */}
      <SignatureSection data={data} />
    </div>
  );
};

export default ProposalContent;
