
import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  proposalRef: React.RefObject<HTMLDivElement>;
  data: Partial<ExtractedData>;
}

const ActionButtons = ({ proposalRef, data }: ActionButtonsProps) => {
  const { toast } = useToast();
  
  const handleGeneratePdf = async () => {
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
      description: "Gerando PDF com alta qualidade, aguarde um momento...",
    });
    
    try {
      await generateProposalPdf(proposalRef.current, data);
      
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso e com alta fidelidade visual!",
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pt-4 flex justify-end gap-3 pdf-action-buttons" data-pdf-remove="true">
      <Button variant="outline" onClick={handlePrint} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      <Button onClick={handleGeneratePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
        <Download className="mr-2 h-4 w-4" />
        Baixar PDF
      </Button>
    </div>
  );
};

export default ActionButtons;
