
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, FileImage, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProposalPreview from "@/components/proposals/card/ProposalPreview";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { generateProposalPdf, generateProposalPng } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsSectionProps {
  onGeneratePdf?: () => void;
  onGeneratePng?: () => void;
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

const ActionButtonsSection = ({ 
  data, 
  companyData 
}: ActionButtonsSectionProps) => {
  const { toast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  
  const handleGeneratePdf = async () => {
    // Find the dialog content element with the proposal
    const previewElement = document.querySelector('.proposal-preview-container');
    
    if (!previewElement) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar a proposta para exportar. Abra a visualização primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando PDF, aguarde um momento...",
    });
    
    try {
      await generateProposalPdf(previewElement as HTMLElement, data);
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePng = async () => {
    // Find the dialog content element with the proposal
    const previewElement = document.querySelector('.proposal-preview-container');
    
    if (!previewElement) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar a proposta para exportar. Abra a visualização primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando imagem PNG, aguarde um momento...",
    });
    
    try {
      await generateProposalPng(previewElement as HTMLElement, data);
      
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
    <div className="flex justify-center gap-3 mb-6 print:hidden" data-pdf-remove="true">
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
            <Eye className="mr-2 h-4 w-4" />
            Visualizar | Baixar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Visualização da Proposta</DialogTitle>
          
          {/* Export buttons positioned at the top of the dialog */}
          <div className="flex justify-end gap-3 mb-4 print:hidden" data-pdf-remove="true">
            <Button variant="outline" onClick={handleGeneratePng} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
              <FileImage className="mr-2 h-4 w-4" />
              Baixar PNG
            </Button>
            <Button onClick={handleGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
              <FileText className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
          
          {/* The proposal preview container with a specific class for targeting */}
          <div className="proposal-preview-container">
            <ProposalPreview 
              data={data}
              companyData={companyData}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionButtonsSection;
