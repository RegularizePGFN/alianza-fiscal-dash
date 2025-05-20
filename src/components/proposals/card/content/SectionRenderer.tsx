
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
  TotalSection,
  CommentsSection,
} from '../sections';

interface SectionRendererProps {
  sectionId: string;
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  economyValue: string;
  renderedSections: Set<string>;
}

const SectionRenderer = ({ 
  sectionId, 
  data, 
  companyData, 
  colors, 
  economyValue, 
  renderedSections 
}: SectionRendererProps) => {
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

export default SectionRenderer;
