
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { generateProposalPdf, generateProposalPng } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Import the new component sections
import ProposalHeader from '../card/sections/ProposalHeader';
import ProposalDataSection from '../card/sections/ProposalDataSection';
import NegotiationDataSection from '../card/sections/NegotiationDataSection';
import FeesDisplaySection from '../card/sections/FeesDisplaySection';
import PaymentOptionsDisplay from '../card/sections/PaymentOptionsDisplay';
import ActionButtonsSection from '../card/sections/ActionButtonsSection';

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
  companyData?: CompanyData | null;
}

const ProposalCard = ({ data, companyData }: ProposalCardProps) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
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
  
  const generatePng = async () => {
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
      description: "Gerando imagem PNG, aguarde um momento...",
    });
    
    try {
      await generateProposalPng(proposalRef.current, data);
      
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
    <div className="flex flex-col space-y-4">
      <Card ref={proposalRef} className="border-border max-w-4xl mx-auto shadow-lg bg-gradient-to-br from-af-blue-50 to-white overflow-hidden">
        {/* Header with Logo */}
        <ProposalHeader
          totalDebt={data.totalDebt}
          discountedValue={data.discountedValue || '0,00'}
        />

        <CardContent className="pt-6 space-y-8 px-8 pb-8">
          {/* Contribuinte Section */}
          <ProposalDataSection data={data} />

          {/* Negociação Section */}
          <NegotiationDataSection data={data} />

          {/* Fees Section - Highlighted */}
          <FeesDisplaySection data={data} />

          {/* Payment Options */}
          <PaymentOptionsDisplay data={data} />
        </CardContent>
      </Card>
      
      {/* Action Button outside the card */}
      <div className="flex justify-center">
        <Button 
          onClick={generatePdf} 
          variant="default" 
          size="lg"
          className="gap-2 px-8"
        >
          <Download className="h-5 w-5" />
          Baixar em PDF
        </Button>
      </div>
    </div>
  );
};

export default ProposalCard;
