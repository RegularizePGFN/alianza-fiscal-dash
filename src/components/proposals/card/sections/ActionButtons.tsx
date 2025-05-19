
import React from 'react';
import { Button } from "@/components/ui/button";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  proposalRef: React.RefObject<HTMLDivElement>;
  data: Partial<ExtractedData>;
}

const ActionButtons = ({ proposalRef, data }: ActionButtonsProps) => {
  const { toast } = useToast();
  
  const printProposal = () => {
    window.print();
  };
  
  const generatePdf = async () => {
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
      await generateProposalPdf(proposalRef.current, data);
      
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
  
  return (
    <div className="pt-6 flex justify-end gap-3">
      <Button variant="outline" onClick={printProposal} className="text-gray-700 hover:bg-gray-50">
        Imprimir
      </Button>
      <Button onClick={generatePdf} className="bg-gray-800 hover:bg-gray-900">
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtons;
