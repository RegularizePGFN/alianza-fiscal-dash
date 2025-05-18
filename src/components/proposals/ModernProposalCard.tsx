
import React, { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModernProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
}

const ModernProposalCard = ({ data }: ModernProposalCardProps) => {
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

  // Format date for display
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateStr;
    }
  };

  // Get specialist name
  const specialistName = data.specialistName || 'Especialista Tributário';
  
  // Create gradient background color based on template colors
  const bgGradient = `linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`;

  return (
    <Card 
      ref={proposalRef} 
      className="max-w-4xl mx-auto overflow-hidden border-0 shadow-xl print:shadow-none" 
      style={{ width: '210mm', minHeight: '297mm', padding: '0', margin: '0 auto' }}
    >
      {/* Header with Gradient Background */}
      <div 
        className="py-8 px-10 text-white relative" 
        style={{ background: bgGradient }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
                alt="Logo" 
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">PROPOSTA / ORÇAMENTO</h1>
                <p className="mt-1 text-lg font-light tracking-wider">{specialistName}</p>
              </div>
            </div>
            
            <div className="mt-4 ml-1 text-sm opacity-90 space-y-1">
              <p className="flex gap-1">
                <span>CNPJ:</span>
                <span>{data.cnpj || '-'}</span>
              </p>
              <p>{data.clientName || 'Cliente'}</p>
              <p>Validade: {formatDateTime(data.validityDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-10 py-12 bg-white">
        <h2 className="text-2xl font-bold text-indigo-900 mb-8 uppercase tracking-wider border-b pb-2">
          ESCOPO DO PROJETO / VALORES
        </h2>
        
        {/* Items with prices - Project Scope */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <div className="text-indigo-800 font-medium tracking-wide uppercase">
              Valor Total da Dívida
            </div>
            <div className="text-right text-lg font-bold text-gray-700">
              R$ {data.totalDebt || '0,00'}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-indigo-800 font-medium tracking-wide uppercase">
              Desconto Aplicado
            </div>
            <div className="text-right text-lg font-bold text-gray-700">
              {data.discountPercentage || '0'}%
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-indigo-800 font-medium tracking-wide uppercase">
              Valor de Entrada
            </div>
            <div className="text-right text-lg font-bold text-gray-700">
              R$ {data.entryValue || '0,00'}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-indigo-800 font-medium tracking-wide uppercase">
              Parcelamento
            </div>
            <div className="text-right text-lg font-bold text-gray-700">
              {data.installments || '0'}x de R$ {data.installmentValue || '0,00'}
            </div>
          </div>
          
          {/* Separator Line */}
          <div className="border-t border-gray-200 my-6"></div>
          
          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <div className="text-indigo-900 font-semibold tracking-wide uppercase">
              Subtotal
            </div>
            <div className="text-right text-xl font-bold text-indigo-900">
              R$ {data.totalDebt || '0,00'}
            </div>
          </div>
          
          {/* Separator Line */}
          <div className="border-t border-gray-200 my-6"></div>
          
          {/* Total */}
          <div className="flex justify-between items-center">
            <div className="text-indigo-900 font-bold text-xl tracking-wide uppercase">
              Total
            </div>
            <div className="text-right text-3xl font-bold text-emerald-600">
              R$ {data.discountedValue || '0,00'}
              <div className="text-sm font-normal text-emerald-500">
                Desconto de {data.discountPercentage || '0'}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="grid grid-cols-2 gap-10 mt-16">
          <div>
            <h3 className="font-bold text-indigo-900 mb-4 text-lg">Formas de Pagamento</h3>
            <p className="text-sm text-gray-600">
              Aceitamos pagamentos à vista, parcelados com juros, parcelados em até {data.installments}x sem juros, PIX, TED, DOC e Boleto.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-indigo-900 mb-4 text-lg">Pagamento</h3>
            <p className="text-sm text-gray-600">
              {data.entryValue ? `Entrada de R$ ${data.entryValue}` : 'Sem entrada'}<br/>
              Parcelas: {data.installments}x de R$ {data.installmentValue || '0,00'}
            </p>
          </div>
        </div>
        
        {/* Additional Comments */}
        {data.additionalComments && (
          <div className="mt-10">
            <h3 className="font-bold text-indigo-900 mb-4 text-lg">Observações</h3>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-md text-sm text-gray-600 whitespace-pre-line">
              {data.additionalComments}
            </div>
          </div>
        )}
        
        {/* Legal Disclaimer */}
        <div className="mt-16">
          <h3 className="font-bold text-indigo-900 mb-4 text-lg">Observações de Acordo e Contrato</h3>
          <p className="text-xs text-gray-500">
            Este documento não tem validade de registro e é apenas uma forma objetiva e prática de apresentar a proposta de parcelamento. Junto a este documento, enviamos todas as informações necessárias por e-mail. A proposta é válida até {formatDateTime(data.validityDate)}.
          </p>
        </div>
        
        {/* Specialist Information */}
        <div className="mt-12 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            Proposta gerada por {specialistName} em {formatDateTime(data.creationDate)}
          </p>
        </div>
      </div>

      {/* Action Buttons - these will be hidden in PDF */}
      <div className="bg-gray-50 px-10 py-6 flex justify-end gap-3 pdf-action-buttons" data-pdf-remove="true">
        <Button variant="outline" onClick={printProposal} className="text-indigo-700 hover:bg-indigo-50">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
        <Button onClick={generatePdf} className="bg-indigo-600 hover:bg-indigo-700">
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
      </div>
    </Card>
  );
};

export default ModernProposalCard;
