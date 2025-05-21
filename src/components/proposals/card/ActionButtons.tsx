
import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download, FileImage } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf, generateProposalPng } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  onPrint: () => void;
  proposalData: Partial<ExtractedData>;
  proposalRef: React.RefObject<HTMLDivElement>;
}

const ActionButtons = ({ onPrint, proposalData, proposalRef }: ActionButtonsProps) => {
  const { toast } = useToast();
  
  const onGeneratePdf = async () => {
    if (!proposalRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Gerando PDF, aguarde um momento...",
    });
    
    try {
      await generateProposalPdf(proposalRef.current, proposalData);
      
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
  
  const onGeneratePng = async () => {
    if (!proposalRef.current) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a imagem PNG. Tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Processando",
      description: "Capturando imagem PNG em alta qualidade...",
    });
    
    try {
      // Use improved PNG generation with higher scale factor and font loading
      await generateProposalPng(proposalRef.current, proposalData);
      
      toast({
        title: "Sucesso",
        description: "Imagem PNG da proposta completa gerada com sucesso!",
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
    <div className="pt-4 flex flex-col md:flex-row justify-end gap-3 px-6 pb-6">
      <Button variant="outline" onClick={onPrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      <Button 
        variant="outline" 
        onClick={onGeneratePng} 
        className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50"
      >
        <FileImage className="mr-2 h-4 w-4" />
        <span>Baixar PNG de Alta Qualidade</span>
      </Button>
      <Button onClick={onGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtons;
