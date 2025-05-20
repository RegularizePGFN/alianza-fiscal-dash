
import React, { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ExtractedData, PDFTemplate } from '@/lib/types/proposals';
import ProposalContent from '../card/ProposalContent';

interface PDFTemplatePreviewProps {
  formData: Partial<ExtractedData>;
  template: PDFTemplate;
  imagePreview: string | null;
}

const PDFTemplatePreview = ({ formData, template, imagePreview }: PDFTemplatePreviewProps) => {
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

  return (
    <Card 
      ref={previewRef} 
      className="border p-0 overflow-hidden shadow-md preview-proposal font-['Roboto',sans-serif]"
      style={{ backgroundColor: colors.background }}
    >
      {layout.showHeader && (
        <div className="relative overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-slate-400 to-slate-100"></div>
          <div className="relative p-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {layout.showLogo && (
                <img 
                  src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
                  alt="Logo" 
                  className="h-12 w-auto"
                />
              )}
              <h2 className="text-xl font-medium" style={{ color: colors.secondary }}>
                Proposta de Parcelamento PGFN
              </h2>
            </div>
          </div>
        </div>
      )}
      
      {/* Use the shared ProposalContent component for consistency */}
      <ProposalContent 
        data={formData}
        isPreview={true}
      />
    </Card>
  );
};

export default PDFTemplatePreview;
