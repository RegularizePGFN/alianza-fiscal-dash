
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, FileImage, FileText, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProposalPreview from "@/components/proposals/card/ProposalPreview";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { generateProposalPdf, generateProposalPng, getProposalHtml } from "@/lib/pdfUtils";
import { generateProposalFiles, fallbackGenerateProposalFiles } from "@/lib/services/puppeteerService";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface ActionButtonsSectionProps {
  data: Partial<ExtractedData>;
  companyData?: CompanyData | null;
}

const ActionButtonsSection = ({ 
  data, 
  companyData 
}: ActionButtonsSectionProps) => {
  const { toast: uiToast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  
  // Function to open PDF or PNG in a new tab
  const openFileInNewTab = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error("Link não disponível");
    }
  };
  
  const handleGeneratePdf = async () => {
    // Find the dialog content element with the proposal
    const previewElement = document.querySelector('.proposal-preview-container');
    
    if (!previewElement) {
      uiToast({
        title: "Erro",
        description: "Não foi possível encontrar a proposta para exportar. Abra a visualização primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    toast.loading("Gerando PDF, aguarde um momento...", { id: "generate-pdf" });
    
    try {
      // Use the new MinIO-based generation if there's already a URL
      if (data.pdfUrl) {
        // Just open the existing PDF
        openFileInNewTab(data.pdfUrl);
        toast.success("PDF aberto com sucesso!", { id: "generate-pdf" });
        setIsGenerating(false);
        return;
      }

      // Try to use the Puppeteer service
      const htmlContent = getProposalHtml(previewElement as HTMLElement);
      
      try {
        const { pdfUrl } = await generateProposalFiles(htmlContent, data);
        openFileInNewTab(pdfUrl);
        toast.success("PDF gerado com sucesso!", { id: "generate-pdf" });
      } catch (puppeteerError) {
        console.error("Error using Puppeteer service:", puppeteerError);
        
        // Fallback to client-side rendering
        if (previewRef.current) {
          // Use local PDF generation as fallback
          await generateProposalPdf(previewRef.current, data);
          toast.success("PDF gerado localmente com sucesso!", { id: "generate-pdf" });
        } else {
          throw new Error("Proposal element not found for fallback rendering");
        }
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Não foi possível gerar o PDF. Tente novamente.", { id: "generate-pdf" });
      
      uiToast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePng = async () => {
    // Find the dialog content element with the proposal
    const previewElement = document.querySelector('.proposal-preview-container');
    
    if (!previewElement) {
      uiToast({
        title: "Erro",
        description: "Não foi possível encontrar a proposta para exportar. Abra a visualização primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    toast.loading("Gerando imagem PNG, aguarde um momento...", { id: "generate-png" });
    
    try {
      // Use the new MinIO-based generation if there's already a URL
      if (data.pngUrl) {
        // Just open the existing PNG
        openFileInNewTab(data.pngUrl);
        toast.success("Imagem PNG aberta com sucesso!", { id: "generate-png" });
        setIsGenerating(false);
        return;
      }

      // Try to use the Puppeteer service
      const htmlContent = getProposalHtml(previewElement as HTMLElement);
      
      try {
        const { pngUrl } = await generateProposalFiles(htmlContent, data);
        openFileInNewTab(pngUrl);
        toast.success("Imagem PNG gerada com sucesso!", { id: "generate-png" });
      } catch (puppeteerError) {
        console.error("Error using Puppeteer service:", puppeteerError);
        
        // Fallback to client-side rendering
        if (previewRef.current) {
          // Use local PNG generation as fallback
          await generateProposalPng(previewRef.current, data);
          toast.success("Imagem PNG gerada localmente com sucesso!", { id: "generate-png" });
        } else {
          throw new Error("Proposal element not found for fallback rendering");
        }
      }
    } catch (error) {
      console.error("Erro ao gerar PNG:", error);
      toast.error("Não foi possível gerar a imagem PNG. Tente novamente.", { id: "generate-png" });
      
      uiToast({
        title: "Erro",
        description: "Não foi possível gerar a imagem PNG. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if we have MinIO URLs available
  const hasMinioUrls = !!(data.pdfUrl || data.pngUrl);

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
            {hasMinioUrls && data.pngUrl && (
              <Button 
                variant="outline" 
                onClick={() => openFileInNewTab(data.pngUrl!)} 
                className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50"
                disabled={isGenerating}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver PNG
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleGeneratePng} 
              className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50"
              disabled={isGenerating}
            >
              <FileImage className="mr-2 h-4 w-4" />
              {hasMinioUrls && data.pngUrl ? 'Baixar PNG' : 'Gerar PNG'}
            </Button>
            
            {hasMinioUrls && data.pdfUrl && (
              <Button 
                variant="outline" 
                onClick={() => openFileInNewTab(data.pdfUrl!)} 
                className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50"
                disabled={isGenerating}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver PDF
              </Button>
            )}
            
            <Button 
              onClick={handleGeneratePdf} 
              className="bg-af-blue-600 hover:bg-af-blue-700"
              disabled={isGenerating}
            >
              <FileText className="mr-2 h-4 w-4" />
              {hasMinioUrls && data.pdfUrl ? 'Baixar PDF' : 'Gerar PDF'}
            </Button>
          </div>
          
          {/* The proposal preview container with a specific class for targeting */}
          <div className="proposal-preview-container" ref={previewRef}>
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
