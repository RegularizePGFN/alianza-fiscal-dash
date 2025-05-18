
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Eye } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import ClientSection from './ClientSection';
import NegotiationSection from './NegotiationSection';
import TotalValueSection from './TotalValueSection';
import FeesSection from './FeesSection';
import PaymentOptionsSection from './PaymentOptionsSection';
import ProposalHeader from './ProposalHeader';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';

interface MiniProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
}

const MiniProposalCard = ({ data, imageUrl }: MiniProposalCardProps) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onViewFullProposal = () => {
    navigate('/propostas/view');
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
  
  const printProposal = () => {
    window.print();
  };
  
  // Get colors from template settings or use defaults
  const colors = (() => {
    if (data.templateColors && typeof data.templateColors === 'string') {
      try {
        return JSON.parse(data.templateColors);
      } catch (e) {}
    }
    return {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#10B981',
      background: '#F8FAFC'
    };
  })();

  // Get layout settings or use defaults
  const layout = (() => {
    if (data.templateLayout && typeof data.templateLayout === 'string') {
      try {
        return JSON.parse(data.templateLayout);
      } catch (e) {}
    }
    return {
      sections: ['client', 'debt', 'payment', 'fees'],
      showHeader: true,
      showLogo: true,
      showWatermark: false
    };
  })();

  // Get specialist name
  const specialistName = data.specialistName || 'Especialista Tributário';
  
  return (
    <Card 
      ref={proposalRef} 
      className="border border-slate-200 shadow-md overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      {layout.showHeader && (
        <CardHeader className="p-0">
          <div className={`py-4 px-6 text-white`} 
               style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {layout.showLogo && (
                  <img 
                    src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
                    alt="Logo" 
                    className="h-10 w-auto"
                  />
                )}
                <div className="text-xl font-bold">Proposta de Parcelamento PGFN</div>
              </div>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Render sections based on layout */}
        {layout.sections.includes('client') && (
          <ClientSection
            cnpj={data.cnpj || ''}
            debtNumber={data.debtNumber || ''}
            businessActivity={data.businessActivity}
          />
        )}

        {layout.sections.includes('debt') && (
          <NegotiationSection
            totalDebt={data.totalDebt || ''}
            discountedValue={data.discountedValue || ''}
            discountPercentage={data.discountPercentage || ''}
            entryValue={data.entryValue || ''}
            entryInstallments={data.entryInstallments || '1'}
            installments={data.installments || ''}
            installmentValue={data.installmentValue || ''}
          />
        )}

        {layout.sections.includes('payment') && (
          <PaymentOptionsSection
            discountedValue={data.discountedValue || ''}
            installments={data.installments || ''}
            installmentValue={data.installmentValue || ''}
            entryValue={data.entryValue || ''}
            entryInstallments={data.entryInstallments || '1'}
          />
        )}

        {layout.sections.includes('total') && (
          <TotalValueSection
            discountedValue={data.discountedValue || ''}
            discountPercentage={data.discountPercentage || ''}
          />
        )}

        {layout.sections.includes('fees') && (
          <FeesSection feesValue={data.feesValue || ''} />
        )}

        <Separator className="my-4" />
        
        <div className="text-center text-xs text-gray-500">
          <p>Especialista Tributário: {specialistName}</p>
        </div>

        <div className="pt-2 flex justify-between pdf-action-buttons" data-pdf-remove="true">
          <Button variant="outline" onClick={onViewFullProposal} size="sm">
            <Eye className="h-3.5 w-3.5 mr-1" />
            Ver Detalhes
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={printProposal} size="sm">
              <Printer className="h-3.5 w-3.5 mr-1" />
              Imprimir
            </Button>
            <Button onClick={generatePdf} className="bg-af-blue-600 hover:bg-af-blue-700" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniProposalCard;
