
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, FileImage, FileText, Printer, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProposalPreview from "@/components/proposals/card/ProposalPreview";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { 
  generateProposalPdf, 
  generateProposalPng, 
  downloadProposalPdf, 
  downloadProposalPng 
} from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Helper to open a print-friendly version for Puppeteer
  const openPrintView = () => {
    // Store the current proposal data in sessionStorage
    sessionStorage.setItem('proposalPrintData', JSON.stringify(data));
    // Open in a new tab
    window.open('/propostas/print/preview', '_blank');
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    
    toast({
      title: "Processando",
      description: "Gerando PDF, aguarde um momento...",
    });
    
    try {
      // Generate PDF using Puppeteer via edge function
      const pdfUrl = await generateProposalPdf(data);
      
      // Download the PDF
      await downloadProposalPdf(pdfUrl);
      
      toast({
        title: "Sucesso",
        description: "PDF gerado e baixado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePng = async () => {
    setIsGenerating(true);
    
    toast({
      title: "Processando",
      description: "Gerando imagem PNG, aguarde um momento...",
    });
    
    try {
      // Generate PNG using Puppeteer via edge function
      const pngUrl = await generateProposalPng(data);
      
      // Download the PNG
      await downloadProposalPng(pngUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem PNG gerada e baixada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar PNG:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem PNG. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    openPrintView();
  };

  return (
    <div className="flex justify-center gap-3 mb-6 print:hidden" data-pdf-remove="true">
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Visualização da Proposta</DialogTitle>
          
          {/* The proposal preview container with a specific class for targeting */}
          <div className="proposal-preview-container">
            <ProposalPreview 
              data={data}
              companyData={companyData}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      <Button variant="outline" onClick={handlePrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleGeneratePng} 
        disabled={isGenerating}
        className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50"
      >
        <FileImage className="mr-2 h-4 w-4" />
        Baixar PNG
      </Button>
      
      <Button 
        onClick={handleGeneratePdf} 
        disabled={isGenerating}
        className="bg-af-blue-600 hover:bg-af-blue-700"
      >
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtonsSection;
