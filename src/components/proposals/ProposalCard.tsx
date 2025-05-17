
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, ArrowRight, FileText, DollarSign, Percent, CreditCard, Calendar, CheckSquare, BriefcaseIcon, Info } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
}

const ProposalCard = ({ data }: ProposalCardProps) => {
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

  const printProposal = () => {
    window.print();
  };

  return (
    <Card ref={proposalRef} className="border-border max-w-4xl mx-auto shadow-lg bg-gradient-to-br from-af-blue-50 to-white overflow-hidden">
      {/* Header with Logo */}
      <CardHeader className="bg-gradient-to-r from-af-blue-600 to-af-blue-800 text-white pb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
              alt="Logo" 
              className="h-14 w-auto"
            />
            <CardTitle className="text-2xl font-bold text-white">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proposta de Parcelamento PGFN
              </div>
            </CardTitle>
          </div>
          <Badge className="bg-af-green-500 hover:bg-af-green-400 text-white text-sm py-1.5 px-3">
            <Percent className="mr-1 h-4 w-4" /> 
            Economia de R$ {data.discountedValue || '0,00'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-8 px-8 pb-8">
        {/* Contribuinte Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
            <BriefcaseIcon className="mr-2 h-5 w-5 text-af-blue-600" />
            Dados do Contribuinte
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700">CNPJ:</span>
              <p className="text-lg">{data.cnpj || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700">Número do Débito:</span>
              <p className="text-lg">{data.debtNumber || '-'}</p>
            </div>
          </div>
        </div>

        {/* Negociação Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
            <CheckSquare className="mr-2 h-5 w-5 text-af-blue-600" />
            Dados da Negociação
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700 flex items-center">
                <DollarSign className="mr-1 h-4 w-4 text-af-blue-600" />
                Valor Consolidado:
              </span>
              <p className="text-lg">R$ {data.totalDebt || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100 bg-gradient-to-br from-af-green-50 to-white">
              <span className="font-medium text-af-green-700 flex items-center">
                <DollarSign className="mr-1 h-4 w-4 text-af-green-600" />
                Valor com Reduções:
              </span>
              <p className="text-lg font-bold text-af-green-700">R$ {data.discountedValue || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700 flex items-center">
                <Percent className="mr-1 h-4 w-4 text-af-blue-600" />
                Percentual de Desconto:
              </span>
              <p className="text-lg">{data.discountPercentage || '-'}%</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700 flex items-center">
                <DollarSign className="mr-1 h-4 w-4 text-af-blue-600" />
                Valor da Entrada:
              </span>
              <p className="text-lg">R$ {data.entryValue || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700 flex items-center">
                <Calendar className="mr-1 h-4 w-4 text-af-blue-600" />
                Número de Parcelas:
              </span>
              <p className="text-lg">{data.installments || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700 flex items-center">
                <DollarSign className="mr-1 h-4 w-4 text-af-blue-600" />
                Valor das Parcelas:
              </span>
              <p className="text-lg">R$ {data.installmentValue || '-'}</p>
            </div>
          </div>
        </div>

        {/* Fees Section - Highlighted */}
        {data.feesValue && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800 flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-af-blue-600" />
              Custos e Honorários
            </h3>
            <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-5 rounded-lg border border-purple-200 shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-purple-800 flex items-center text-lg">
                    <BriefcaseIcon className="mr-2 h-5 w-5 text-purple-700" />
                    Honorários Aliança Fiscal:
                  </span>
                  <p className="text-sm text-purple-600 mt-1">
                    <Info className="inline-block mr-1 h-4 w-4" />
                    Pagamento imediato
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">R$ {data.feesValue}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Value Section */}
        <div className="mt-8 bg-gradient-to-r from-af-blue-700 to-af-blue-800 p-6 rounded-lg text-white shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-1 flex items-center">
                <DollarSign className="mr-1 h-5 w-5" />
                Valor Total:
              </h3>
              <p className="text-sm opacity-80">Incluindo todas as reduções aplicáveis</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                R$ {data.discountedValue || '0,00'}
              </p>
              <div className="flex items-center text-af-green-300 mt-1">
                <ArrowRight className="h-4 w-4 mr-1" />
                <span className="text-sm">Economia de {data.discountPercentage || '0'}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="bg-white p-5 rounded-lg border border-af-blue-200 shadow-sm">
          <h3 className="text-lg font-semibold text-af-blue-800 mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-af-blue-600" />
            Opções de Pagamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-af-blue-100 rounded p-4 hover:bg-af-blue-50 transition-colors">
              <p className="font-medium text-af-blue-700">À Vista</p>
              <p className="text-lg font-bold">R$ {data.discountedValue || '0,00'}</p>
            </div>
            <div className="border border-af-blue-100 rounded p-4 hover:bg-af-blue-50 transition-colors">
              <p className="font-medium text-af-blue-700">Parcelado</p>
              <p className="text-lg font-bold">{data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</p>
              <p className="text-xs text-gray-500">Entrada de R$ {data.entryValue || '0,00'}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Action Buttons */}
        <div className="pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={printProposal} className="border-af-blue-300 text-af-blue-700 hover:bg-af-blue-50">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={generatePdf} className="bg-af-blue-600 hover:bg-af-blue-700">
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
