
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Eye, FileText, Briefcase, AlertTriangle, CheckSquare, DollarSign, Percent, CreditCard, Calendar, User, MessageSquare, CircleCheck } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdf-utils";
import { useToast } from "@/hooks/use-toast";
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
  
  return (
    <Card 
      ref={proposalRef} 
      className="border shadow-sm overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      {layout.showHeader && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-slate-400 to-slate-100"></div>
          <div className="relative py-3 px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {layout.showLogo && (
                <img 
                  src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
                  alt="Logo" 
                  className="h-8 w-auto"
                />
              )}
              <h2 className="text-sm font-medium" style={{ color: colors.secondary }}>
                Proposta de Parcelamento PGFN
              </h2>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-4 space-y-4">
        {/* Cliente */}
        {layout.sections.includes('client') && (
          <div className="space-y-1">
            <h3 className="text-xs font-medium pb-1 border-b border-gray-200 mb-2" style={{ color: colors.secondary }}>
              <Briefcase className="inline-block mr-1 h-3 w-3" style={{ color: colors.secondary }} />
              Dados do Contribuinte
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <span className="text-[10px] font-medium text-gray-500">CNPJ:</span>
                <p>{data.cnpj || '-'}</p>
              </div>
              
              <div className="bg-gray-50 p-2 rounded text-xs">
                <span className="text-[10px] font-medium text-gray-500">Número do Débito:</span>
                <p>{data.debtNumber || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Alerta */}
        {layout.sections.includes('alert') && (
          <div className="bg-amber-50 border-l-2 border-amber-400 p-2 rounded text-xs">
            <div className="flex items-start">
              <AlertTriangle className="text-amber-500 h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Consequências da Dívida Ativa</h4>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  Protesto, execução fiscal, bloqueio de bens
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Negociação */}
        {layout.sections.includes('debt') && (
          <div className="space-y-1">
            <h3 className="text-xs font-medium pb-1 border-b border-gray-200 mb-2" style={{ color: colors.secondary }}>
              <CheckSquare className="inline-block mr-1 h-3 w-3" style={{ color: colors.secondary }} />
              Dados da Negociação
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <span className="text-[10px] font-medium text-gray-500 flex items-center">
                  <DollarSign className="h-2.5 w-2.5 mr-1 text-gray-500" /> Valor Consolidado:
                </span>
                <p>R$ {data.totalDebt || '-'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded bg-green-50 text-xs">
                <span className="text-[10px] font-medium text-green-700 flex items-center">
                  <DollarSign className="h-2.5 w-2.5 mr-1 text-green-600" /> Valor com Reduções:
                </span>
                <p className="font-medium text-green-700">R$ {data.discountedValue || '-'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded text-xs">
                <span className="text-[10px] font-medium text-gray-500 flex items-center">
                  <Percent className="h-2.5 w-2.5 mr-1 text-gray-500" /> Desconto:
                </span>
                <p>{data.discountPercentage || '-'}%</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <span className="text-[10px] font-medium text-gray-500 flex items-center">
                  <Calendar className="h-2.5 w-2.5 mr-1 text-gray-500" /> Parcelas:
                </span>
                <p>{data.installments || '-'}x de R$ {data.installmentValue || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pagamento */}
        {layout.sections.includes('payment') && (
          <div>
            <h3 className="text-xs font-medium pb-1 border-b border-gray-200 mb-2" style={{ color: colors.secondary }}>
              <CreditCard className="inline-block mr-1 h-3 w-3" style={{ color: colors.secondary }} />
              Opções de Pagamento
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs">
                <span className="text-[10px] font-medium text-gray-700 flex items-center">
                  <CircleCheck className="h-2.5 w-2.5 mr-1 text-gray-600" /> À Vista
                </span>
                <p className="font-medium">R$ {data.discountedValue || '0,00'}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs">
                <span className="text-[10px] font-medium text-gray-700 flex items-center">
                  <CircleCheck className="h-2.5 w-2.5 mr-1 text-gray-600" /> Parcelado
                </span>
                <p className="font-medium">
                  {data.installments || '0'}x de R$ {data.installmentValue || '0,00'}
                </p>
                {parseInt(data.entryInstallments || '1') > 1 ? (
                  <p className="text-[9px] text-gray-500">
                    Entrada: {data.entryInstallments}x de R$ {entryInstallmentValue()}
                  </p>
                ) : (
                  <p className="text-[9px] text-gray-500">
                    Entrada de R$ {data.entryValue || '0,00'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Honorários */}
        {layout.sections.includes('fees') && data.feesValue && (
          <div>
            <h3 className="text-xs font-medium pb-1 border-b border-gray-200 mb-2" style={{ color: colors.secondary }}>
              <User className="inline-block mr-1 h-3 w-3" style={{ color: colors.secondary }} />
              Custos e Honorários
            </h3>
            
            <div className="bg-gray-50 p-2 rounded border-l-2 text-xs" style={{ borderLeftColor: colors.accent }}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-medium text-gray-700 flex items-center">
                    <Briefcase className="h-2.5 w-2.5 mr-1 text-gray-600" />
                    Honorários Aliança Fiscal:
                  </span>
                  <p className="text-[9px] text-gray-500">
                    Especialista - {specialistName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium" style={{ color: colors.accent }}>
                    R$ {data.feesValue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Observações */}
        {data.additionalComments && (
          <div>
            <h3 className="text-xs font-medium pb-1 border-b border-gray-200 mb-2" style={{ color: colors.secondary }}>
              <MessageSquare className="inline-block mr-1 h-3 w-3" style={{ color: colors.secondary }} />
              Observações
            </h3>
            
            <div className="bg-gray-50 p-2 rounded border border-gray-100 text-[10px]">
              <p className="whitespace-pre-line">{data.additionalComments}</p>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="text-center text-[10px] text-gray-500 pt-2">
          <p>Especialista Tributário: {specialistName}</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex justify-between pdf-action-buttons" data-pdf-remove="true">
          <Button variant="outline" onClick={onViewFullProposal} size="sm" className="h-8 text-[11px]">
            <Eye className="h-3 w-3 mr-1" />
            Ver Detalhes
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={printProposal} size="sm" className="h-8 text-[11px]">
              <Printer className="h-3 w-3 mr-1" />
              Imprimir
            </Button>
            <Button onClick={generatePdf} className="bg-gray-800 hover:bg-gray-900 h-8 text-[11px]">
              <Download className="h-3 w-3 mr-1" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniProposalCard;
