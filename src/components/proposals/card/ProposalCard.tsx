
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExtractedData, CompanyData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Import the component sections
import ProposalHeader from '../card/sections/ProposalHeader';
import ProposalDataSection from '../card/sections/ProposalDataSection';
import NegotiationDataSection from '../card/sections/NegotiationDataSection';
import ObservationsSection from '../card/sections/ObservationsSection';
import PaymentOptionsDisplay from '../card/sections/PaymentOptionsDisplay';
import FeesDisplaySection from '../card/sections/FeesDisplaySection';
import CompanyInfoSection from '../card/sections/CompanyInfoSection';

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

  return (
    <div className="flex flex-col space-y-4">
      <Card 
        ref={proposalRef} 
        className="border-0 max-w-4xl mx-auto shadow-none bg-gradient-to-br from-af-blue-50 to-white rounded-none overflow-visible"
      >
        {/* Header with Logo */}
        <ProposalHeader
          totalDebt={data.totalDebt}
          discountedValue={data.discountedValue || '0,00'}
        />

        <CardContent className="pt-3 space-y-4 px-5 pb-5">
          {/* CNPJ and Company Data Section */}
          {companyData ? (
            <CompanyInfoSection 
              companyData={companyData} 
              colors={{ secondary: '#1E40AF' }}
            />
          ) : (
            <ProposalDataSection data={data} />
          )}

          {/* Negociação Section */}
          <NegotiationDataSection data={data} />

          {/* Payment Options - Now before fees */}
          <PaymentOptionsDisplay data={data} />

          {/* Observations Section - Only if additionalComments exists */}
          <ObservationsSection data={data} />
          
          {/* Fees Section - Now last */}
          <FeesDisplaySection data={data} />
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
