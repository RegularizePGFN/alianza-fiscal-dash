
import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ExtractedData, PDFTemplate, CompanyData } from '@/lib/types/proposals';
import ProposalContent from '../card/ProposalContent';
import FooterSection from '../card/sections/FooterSection';

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

  // Parse layout settings
  const layout = (() => {
    if (formData.templateLayout && typeof formData.templateLayout === 'string') {
      try {
        return JSON.parse(formData.templateLayout);
      } catch (e) {
        console.error('Failed to parse template layout', e);
      }
    }
    
    return {
      sections: template.defaultLayout,
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
  })();

  // A4 dimensions with adjusted scale (using 3.7795 pixels per mm)
  const a4Width = 210 * 3.7795 * 0.65;
  const a4Height = 297 * 3.7795 * 0.65;

  return (
    <Card 
      ref={previewRef} 
      className="border-0 p-0 overflow-visible shadow-none preview-proposal font-['Roboto',sans-serif] transition-colors mx-auto rounded-none"
      style={{ 
        backgroundColor: colors.background,
        width: `${a4Width}px`,
        height: `${a4Height}px`,
        maxHeight: '100%',
        aspectRatio: '210/297', // A4 ratio
        overflow: 'auto'
      }}
    >
      {layout.showHeader && (
        <div className="relative overflow-hidden print:break-after-avoid rounded-none">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-slate-400 to-slate-100"></div>
          <div className="relative p-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {layout.showLogo && (
                <img 
                  src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
                  alt="Logo" 
                  className="h-10 w-auto"
                />
              )}
              <h2 className="text-lg font-medium" style={{ color: colors.secondary }}>
                Proposta de Parcelamento PGFN
              </h2>
            </div>
          </div>
        </div>
      )}
      
      {/* Use the shared ProposalContent component for consistency */}
      <ProposalContent 
        data={formData}
        companyData={companyData}
        isPreview={true}
      />
      
      {/* Add thin footer bar */}
      <FooterSection data={formData} />
    </Card>
  );
};

export default PDFTemplatePreview;
