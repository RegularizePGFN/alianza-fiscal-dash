
import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ExtractedData, PDFTemplate, CompanyData } from '@/lib/types/proposals';
import PaginatedProposalView from '../card/PaginatedProposalView';

interface PDFTemplatePreviewProps {
  formData: Partial<ExtractedData>;
  template: PDFTemplate;
  imagePreview: string | null;
  companyData?: CompanyData | null;
}

const PDFTemplatePreview = ({ 
  formData, 
  template, 
  imagePreview,
  companyData 
}: PDFTemplatePreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Parse template colors from formData or use defaults from selected template
  const colors = (() => {
    if (formData.templateColors && typeof formData.templateColors === 'string') {
      try {
        return JSON.parse(formData.templateColors);
      } catch (e) {
        console.error('Failed to parse template colors', e);
      }
    }
    
    return {
      primary: template.primaryColor,
      secondary: template.secondaryColor,
      accent: template.accentColor,
      background: template.backgroundColor
    };
  })();

  return (
    <Card 
      ref={previewRef} 
      className="border-0 p-0 overflow-hidden shadow-md preview-proposal font-['Roboto',sans-serif] transition-colors mx-auto"
      style={{ 
        backgroundColor: colors.background,
        maxHeight: '100%',
        overflow: 'auto'
      }}
    >
      {/* Use the paginated proposal view for the preview */}
      <PaginatedProposalView 
        data={formData}
        companyData={companyData}
        className="pdf-template-preview"
      />
    </Card>
  );
};

export default PDFTemplatePreview;
