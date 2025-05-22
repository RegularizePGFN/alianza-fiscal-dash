
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileCheck, Download } from "lucide-react";
import { PDFTemplatePreview } from "@/components/proposals/pdf-editor";
import { ExtractedData, PDFTemplate, CompanyData } from "@/lib/types/proposals";
import { generateSimplifiedProposalPng } from "@/lib/pdfUtils";

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
  const handleGenerateSimplifiedImage = async () => {
    try {
      await generateSimplifiedProposalPng(formData, companyData);
    } catch (error) {
      console.error("Error generating simplified image:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="sticky top-4 mb-4">
        {/* Botões de visualização e exportação acima do preview */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-4">
          <Button onClick={onGeneratePDF} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Baixar em PDF
          </Button>
          
          <Button onClick={handleGenerateSimplifiedImage} variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            Resumo com Dados
          </Button>
        </div>
        
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
