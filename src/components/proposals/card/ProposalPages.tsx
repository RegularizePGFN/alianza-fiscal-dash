
import React from 'react';
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import ProposalContent from './ProposalContent';
import { HeaderSection } from './sections';

interface ProposalPagesProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

/**
 * A component designed specifically for high-quality PDF/PNG rendering with Puppeteer
 * This renders the proposal in a print-friendly format with proper A4 dimensions
 */
const ProposalPages: React.FC<ProposalPagesProps> = ({ data, companyData }) => {
  // Get colors from template settings or use defaults
  const colors = (() => {
    try {
      if (data.templateColors && typeof data.templateColors === 'string') {
        return JSON.parse(data.templateColors);
      }
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
    <div 
      className="bg-white font-['Roboto',sans-serif] print-proposal"
      style={{
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: 0,
        backgroundColor: colors.background,
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

      {/* Main content */}
      <ProposalContent 
        data={data}
        companyData={companyData}
      />
    </div>
  );
};

export default ProposalPages;
