
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { PDFTemplatePreview } from "@/components/proposals/pdf-editor";
import { ExtractedData, PDFTemplate } from "@/lib/types/proposals";

interface ProposalPreviewContainerProps {
  formData: Partial<ExtractedData>;
  selectedTemplate: PDFTemplate;
  imagePreview: string | null;
  onGeneratePDF: () => Promise<void>;
}

export const ProposalPreviewContainer = ({
  formData,
  selectedTemplate,
  imagePreview,
  onGeneratePDF
}: ProposalPreviewContainerProps) => {
  const previewRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={previewRef} className="flex flex-col">
      <div className="sticky top-4 mb-4">
        <PDFTemplatePreview 
          formData={formData}
          template={selectedTemplate}
          imagePreview={imagePreview}
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
