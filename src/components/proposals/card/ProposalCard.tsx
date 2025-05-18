
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, ArrowRight, FileText, DollarSign, Percent, CreditCard, Calendar, CheckSquare, BriefcaseIcon, Info, Clock } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  };

  // Calculate entry installment value
  const entryInstallmentValue = () => {
    if (data.entryValue && data.entryInstallments) {
      try {
        const entryValue = parseFloat(data.entryValue.replace(/\./g, '').replace(',', '.'));
        const installments = parseInt(data.entryInstallments);
        
        if (!isNaN(entryValue) && !isNaN(installments) && installments > 0) {
          const installmentValue = entryValue / installments;
          return installmentValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      } catch (error) {
        console.error("Error calculating entry installment value:", error);
      }
    }
    return "0,00";
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
    <Card ref={proposalRef} className="border-border max-w-4xl mx-auto shadow-lg overflow-hidden"
          style={{ backgroundColor: colors.background }}>
      {/* Header with Logo */}
      {layout?.showHeader && (
        <CardHeader className="text-white pb-8" 
                   style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {layout?.showLogo && (
                <img 
                  src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
                  alt="Logo" 
                  className="h-14 w-auto"
                />
              )}
              <CardTitle className="text-2xl font-bold text-white">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Proposta de Parcelamento PGFN
                </div>
              </CardTitle>
            </div>
            <Badge className="bg-af-green-500 hover:bg-af-green-400 text-white text-sm py-1.5 px-3">
              <Percent className="mr-1 h-4 w-4" /> 
              Economia de {data.discountPercentage || '0'}%
            </Badge>
          </div>
        </CardHeader>
      )}

      <CardContent className="pt-6 space-y-8 px-8 pb-8">
        {/* Metadata Section */}
        {(data.creationDate || data.validityDate) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-md border" style={{ borderColor: colors.primary }}>
              <span className="text-xs font-medium flex items-center" style={{ color: colors.secondary }}>
                <Clock className="mr-1 h-3 w-3" />
                Data de Criação:
              </span>
              <p className="text-sm">{formatDateTime(data.creationDate)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-md border" style={{ borderColor: colors.primary }}>
              <span className="text-xs font-medium flex items-center" style={{ color: colors.secondary }}>
                <Calendar className="mr-1 h-3 w-3" />
                Data de Validade:
              </span>
              <p className="text-sm">{formatDateTime(data.validityDate)}</p>
            </div>
          </div>
        )}
        
        {/* Contribuinte Section */}
        {layout?.sections.includes('client') && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2 flex items-center" 
                style={{ borderColor: colors.primary, color: colors.primary }}>
              <BriefcaseIcon className="mr-2 h-5 w-5" style={{ color: colors.secondary }} />
              Dados do Contribuinte
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-md shadow-sm border" style={{ borderColor: colors.primary }}>
                <span className="font-medium" style={{ color: colors.secondary }}>CNPJ:</span>
                <p className="text-lg">{data.cnpj || '-'}</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border" style={{ borderColor: colors.primary }}>
                <span className="font-medium" style={{ color: colors.secondary }}>Número do Débito:</span>
                <p className="text-lg">{data.debtNumber || '-'}</p>
              </div>
              {data.clientName && (
                <div className="bg-white p-4 rounded-md shadow-sm border col-span-2" style={{ borderColor: colors.primary }}>
                  <span className="font-medium" style={{ color: colors.secondary }}>Razão Social:</span>
                  <p className="text-lg">{data.clientName}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {layout?.sections.includes('alert') && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-yellow-800 text-sm">
            <div className="flex gap-2">
              <Info className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="font-semibold mb-1">Alerta! Consequências da Dívida:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Bloqueio de bens e valores</li>
                  <li>Impossibilidade de participação em licitações</li>
                  <li>Restrição de acesso a crédito</li>
                  <li>Inclusão no CADIN e negativação do CNPJ/CPF</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Negociação Section */}
        {layout?.sections.includes('debt') && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2 flex items-center"
                style={{ borderColor: colors.primary, color: colors.primary }}>
              <CheckSquare className="mr-2 h-5 w-5" style={{ color: colors.secondary }} />
              Dados da Negociação
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-md shadow-sm border" style={{ borderColor: colors.primary }}>
                <span className="font-medium flex items-center" style={{ color: colors.secondary }}>
                  <DollarSign className="mr-1 h-4 w-4" />
                  Valor Consolidado:
                </span>
                <p className="text-lg">R$ {data.totalDebt || '-'}</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border" 
                   style={{ borderColor: colors.accent, backgroundColor: `${colors.background}30` }}>
                <span className="font-medium flex items-center" style={{ color: colors.accent }}>
                  <DollarSign className="mr-1 h-4 w-4" />
                  Valor com Reduções:
                </span>
                <p className="text-lg font-bold" style={{ color: colors.accent }}>
                  R$ {data.discountedValue || '-'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border" style={{ borderColor: colors.primary }}>
                <span className="font-medium flex items-center" style={{ color: colors.secondary }}>
                  <Percent className="mr-1 h-4 w-4" />
                  Percentual de Desconto:
                </span>
                <p className="text-lg">{data.discountPercentage || '-'}%</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border" style={{ borderColor: colors.primary }}>
                <span className="font-medium flex items-center" style={{ color: colors.secondary }}>
                  <DollarSign className="mr-1 h-4 w-4" />
                  {parseInt(data.entryInstallments || '1') > 1 ? 
                    `Entrada: ${data.entryInstallments}x` : 
                    'Valor da Entrada:'
                  }
                </span>
                <p className="text-lg">
                  {parseInt(data.entryInstallments || '1') > 1 ? 
                    `R$ ${entryInstallmentValue()} (Total: R$ ${data.entryValue || '0,00'})` : 
                    `R$ ${data.entryValue || '-'}`
                  }
                </p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border" style={{ borderColor: colors.primary }}>
                <span className="font-medium flex items-center" style={{ color: colors.secondary }}>
                  <Calendar className="mr-1 h-4 w-4" />
                  Número de Parcelas:
                </span>
                <p className="text-lg">{data.installments || '-'}</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm border" style={{ borderColor: colors.primary }}>
                <span className="font-medium flex items-center" style={{ color: colors.secondary }}>
                  <DollarSign className="mr-1 h-4 w-4" />
                  Valor das Parcelas:
                </span>
                <p className="text-lg">R$ {data.installmentValue || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fees Section - Highlighted */}
        {layout?.sections.includes('fees') && data.feesValue && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2 flex items-center"
                style={{ borderColor: colors.primary, color: colors.primary }}>
              <CreditCard className="mr-2 h-5 w-5" style={{ color: colors.secondary }} />
              Custos e Honorários
            </h3>
            <div className="p-5 rounded-lg border shadow-md"
                 style={{ backgroundColor: `${colors.accent}10`, borderColor: colors.accent }}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold flex items-center text-lg" style={{ color: colors.accent }}>
                    <BriefcaseIcon className="mr-2 h-5 w-5" />
                    Honorários Aliança Fiscal:
                  </span>
                  <p className="text-sm mt-1" style={{ color: colors.accent, opacity: 0.8 }}>
                    <Info className="inline-block mr-1 h-4 w-4" />
                    Pagamento imediato
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                    R$ {data.feesValue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Value Section */}
        {layout?.sections.includes('total') && (
          <div className="mt-8 p-6 rounded-lg text-white shadow-md"
               style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})` }}>
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
        )}

        {/* Payment Options */}
        {layout?.sections.includes('payment') && (
          <div className="bg-white p-5 rounded-lg border shadow-sm" style={{ borderColor: colors.primary }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: colors.primary }}>
              <CreditCard className="mr-2 h-5 w-5" style={{ color: colors.secondary }} />
              Opções de Pagamento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 hover:bg-slate-50 transition-colors" style={{ borderColor: colors.primary }}>
                <p className="font-medium" style={{ color: colors.secondary }}>À Vista</p>
                <p className="text-lg font-bold">R$ {data.discountedValue || '0,00'}</p>
              </div>
              <div className="border p-4 hover:bg-slate-50 transition-colors" style={{ borderColor: colors.primary }}>
                <p className="font-medium" style={{ color: colors.secondary }}>Parcelado</p>
                <p className="text-lg font-bold">{data.installments || '0'}x de R$ {data.installmentValue || '0,00'}</p>
                {parseInt(data.entryInstallments || '1') > 1 ? (
                  <p className="text-xs text-gray-500">Entrada em {data.entryInstallments}x de R$ {entryInstallmentValue()}</p>
                ) : (
                  <p className="text-xs text-gray-500">Entrada de R$ {data.entryValue || '0,00'}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Specialist Information */}
        <div className="text-center text-sm" style={{ color: colors.secondary }}>
          <p>Elaborado por: <span className="font-semibold">{specialistName}</span></p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={printProposal} className="text-af-blue-700 hover:bg-af-blue-50">
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
