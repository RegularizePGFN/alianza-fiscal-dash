
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download, FileImage, Sparkles } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf, generateProposalPng } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ActionButtonsProps {
  onPrint: () => void;
  proposalData: Partial<ExtractedData>;
  proposalRef: React.RefObject<HTMLDivElement>;
}

const ActionButtons = ({ onPrint, proposalData, proposalRef }: ActionButtonsProps) => {
  const { toast } = useToast();
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
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
      // Use improved PNG generation that captures exactly what's shown in the browser
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

  const onGenerateAIImage = async () => {
    setIsGeneratingAI(true);
    toast({
      title: "Processando",
      description: "Gerando imagem com Inteligência Artificial, aguarde...",
    });
    
    try {
      // Format proposal data for the AI
      const requestData = {
        data: proposalData,
        especialista: proposalData.sellerName || proposalData.specialistName,
        cores: {
          primaria: '#3B82F6',
          secundaria: '#1E40AF',
          fundo: '#F8FAFC'
        },
        preferencias: {
          mostrarLogo: true,
          mostrarRodape: true
        }
      };
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('render-proposal-image', {
        body: requestData
      });
      
      if (error) {
        throw new Error(error.message || 'Falha ao gerar imagem');
      }
      
      if (!data || !data.imageUrl) {
        throw new Error('Resposta inválida da função de geração de imagem');
      }
      
      // Download the image
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `proposta_pgfn_${proposalData.cnpj?.replace(/\D/g, '')}_ai.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso",
        description: "Imagem gerada com IA baixada com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar imagem com IA:", error);
      toast({
        title: "Erro",
        description: `Não foi possível gerar a imagem com IA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="pt-4 flex flex-wrap justify-end gap-3 px-6 pb-6">
      <Button variant="outline" onClick={onPrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      <Button 
        variant="outline" 
        onClick={onGeneratePng} 
        className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50 relative"
      >
        <FileImage className="mr-2 h-4 w-4" />
        <span>Baixar PNG (Captura de Tela)</span>
      </Button>
      <Button 
        variant="outline" 
        onClick={onGenerateAIImage} 
        disabled={isGeneratingAI}
        className="border-purple-300 text-purple-700 hover:bg-purple-50 relative"
      >
        <Sparkles className={`mr-2 h-4 w-4 ${isGeneratingAI ? 'animate-pulse' : ''}`} />
        <span>{isGeneratingAI ? 'Gerando imagem...' : 'Baixar PNG (IA)'}</span>
      </Button>
      <Button onClick={onGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtons;
