
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { PDFTemplatePreview } from "@/components/proposals/pdf-editor";
import { ExtractedData, PDFTemplate, CompanyData } from "@/lib/types/proposals";
import { ActionButtonsSection } from "@/components/proposals/card/sections";

interface ProposalPreviewContainerProps {
  formData: Partial<ExtractedData>;
  selectedTemplate: PDFTemplate;
  imagePreview: string | null;
  companyData?: CompanyData | null;
  onGeneratePDF: () => Promise<void>;
}

export const ProposalPreviewContainer = ({
  formData,
  selectedTemplate,
  imagePreview,
  companyData,
  onGeneratePDF
}: ProposalPreviewContainerProps) => {
  return (
    <div className="flex flex-col">
      <div className="sticky top-4 mb-4">
        {/* Botões de visualização e exportação acima do preview */}
        <ActionButtonsSection 
          data={formData}
          companyData={companyData}
        />
        
        <PDFTemplatePreview 
          formData={formData}
          template={selectedTemplate}
          imagePreview={imagePreview}
          companyData={companyData}
        />
        
        <Button 
          onClick={onGeneratePDF}
          className="w-full mt-4"
          size="lg"
        >
          <FileCheck className="h-5 w-5 mr-2" />
          Gerar Proposta
        </Button>
      </div>
    </div>
  );
};
