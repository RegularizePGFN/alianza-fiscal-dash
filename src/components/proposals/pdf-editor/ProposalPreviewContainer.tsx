
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { FileCheck, Download, Printer, FileImage } from "lucide-react";
import { PDFTemplatePreview } from "@/components/proposals/pdf-editor";
import { ExtractedData, PDFTemplate, CompanyData } from "@/lib/types/proposals";
import { generateProposalPdf, generateProposalPng } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";

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
  const previewRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  
  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = async () => {
    await onGeneratePDF();
  };
  
  const handleGeneratePng = async () => {
    if (!previewRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem PNG. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando imagem PNG de alta qualidade, aguarde...",
    });
    
    try {
      // Use the updated function to capture exact screen appearance
      await generateProposalPng(previewRef.current, formData);
      
      toast({
        title: "Sucesso",
        description: "Imagem PNG gerada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PNG:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem PNG. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div ref={previewRef} className="flex flex-col">
      <div className="sticky top-4 mb-4">
        {/* Botões de ação acima do preview da proposta */}
        <div className="flex justify-center gap-3 mb-4 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleGeneratePng} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
            <FileImage className="mr-2 h-4 w-4" />
            Baixar PNG
          </Button>
          <Button onClick={handleGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
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
