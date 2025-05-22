
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, FileImage, FilePdf, Share2 } from "lucide-react";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { generateSimplifiedProposalPng } from "@/lib/pdfUtils";

interface ActionButtonsSectionProps {
  onGeneratePdf: () => void;
  onGeneratePng: () => void;
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

const ActionButtonsSection = ({ 
  onGeneratePdf, 
  onGeneratePng, 
  data,
  companyData
}: ActionButtonsSectionProps) => {
  const handleGenerateSimplifiedImage = async () => {
    try {
      await generateSimplifiedProposalPng(data, companyData);
    } catch (error) {
      console.error("Error generating simplified image:", error);
    }
  };
  
  return (
    <div 
      className="flex flex-col sm:flex-row gap-2 justify-center" 
      data-pdf-remove="true"
    >
      <Button onClick={onGeneratePdf} variant="outline" className="gap-2">
        <FilePdf className="h-4 w-4" />
        Gerar PDF
      </Button>
      
      <Button onClick={onGeneratePng} variant="outline" className="gap-2">
        <FileImage className="h-4 w-4" />
        Exportar Imagem
      </Button>
      
      <Button onClick={handleGenerateSimplifiedImage} variant="secondary" className="gap-2">
        <Download className="h-4 w-4" />
        Resumo com Dados
      </Button>
    </div>
  );
};

export default ActionButtonsSection;
