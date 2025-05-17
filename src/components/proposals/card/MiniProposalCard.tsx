import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";
import { generateProposalPdf } from "@/lib/pdfUtils";
import { useToast } from "@/hooks/use-toast";

interface MiniProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
}

const MiniProposalCard = ({ data }: MiniProposalCardProps) => {
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

  // Format currency values
  const formatCurrency = (value?: string) => {
    if (!value) return "0,00";
    
    // If it already has a comma as decimal separator, format properly
    if (value.includes(',')) {
      const parts = value.split(',');
      if (parts.length === 2) {
        // Ensure exactly 2 decimal places
        const decimal = parts[1].substring(0, 2).padEnd(2, '0');
        return `${parts[0]},${decimal}`;
      }
    }
    
    // Otherwise try to parse and format
    try {
      const num = parseFloat(value.replace(/\./g, '').replace(',', '.'));
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) {
      return value;
    }
  };

  return (
    <Card ref={proposalRef} className="border-border max-w-4xl mx-auto shadow-lg overflow-hidden print:shadow-none">
      {/* Header */}
      <div className="bg-af-blue-700 text-white p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/d939ccfc-a061-45e8-97e0-1fa1b82d3df2.png" 
              alt="Logo" 
              className="h-12 w-auto"
            />
            <h2 className="text-xl font-bold">
              Proposta de Parcelamento PGFN
            </h2>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-4 text-sm">
        {/* Metadata Section */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded">
            <span className="font-medium text-af-blue-700">
              Data de Criação:
            </span>
            <p>{data.creationDate || '-'}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="font-medium text-af-blue-700">
              Data de Validade:
            </span>
            <p>{data.validityDate || '-'}</p>
          </div>
        </div>
        
        {/* Contribuinte Section */}
        <div>
          <h3 className="font-semibold border-b border-af-blue-200 pb-1 text-af-blue-800">
            Dados do Contribuinte
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-white p-2 rounded border border-af-blue-100">
              <span className="text-xs font-medium text-af-blue-700">CNPJ:</span>
              <p>{data.cnpj || '-'}</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100">
              <span className="text-xs font-medium text-af-blue-700">Cliente:</span>
              <p>{data.clientName || '-'}</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100 col-span-2">
              <span className="text-xs font-medium text-af-blue-700">Número do Débito:</span>
              <p>{data.debtNumber || '-'}</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100 col-span-2">
              <span className="text-xs font-medium text-af-blue-700">Atividade:</span>
              <p className="text-xs">{data.businessActivity || '-'}</p>
            </div>
          </div>
        </div>

        {/* Negociação Section */}
        <div>
          <h3 className="font-semibold border-b border-af-blue-200 pb-1 text-af-blue-800">
            Dados da Negociação
          </h3>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-white p-2 rounded border border-af-blue-100">
              <span className="text-xs font-medium text-af-blue-700">
                Valor Consolidado:
              </span>
              <p>R$ {formatCurrency(data.totalDebt)}</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100 col-span-2 bg-gradient-to-br from-af-green-50 to-white">
              <span className="text-xs font-medium text-af-green-700">
                Valor com Reduções:
              </span>
              <p className="font-bold text-af-green-700">R$ {formatCurrency(data.discountedValue)}</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100">
              <span className="text-xs font-medium text-af-blue-700">
                Desconto:
              </span>
              <p>{data.discountPercentage || '0'}%</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100">
              <span className="text-xs font-medium text-af-blue-700">
                Parcelas (Entrada):
              </span>
              <p>{data.entryInstallments || '1'}</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100">
              <span className="text-xs font-medium text-af-blue-700">
                Valor (Entrada):
              </span>
              <p>R$ {formatCurrency(data.entryValue)}</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100">
              <span className="text-xs font-medium text-af-blue-700">
                Parcelas:
              </span>
              <p>{data.installments || '0'}</p>
            </div>
            <div className="bg-white p-2 rounded border border-af-blue-100 col-span-2">
              <span className="text-xs font-medium text-af-blue-700">
                Valor das Parcelas:
              </span>
              <p>R$ {formatCurrency(data.installmentValue)}</p>
            </div>
          </div>
        </div>

        {/* Fees Section */}
        {data.feesValue && (
          <div className="bg-gradient-to-r from-purple-100 to-blue-50 p-3 rounded border border-purple-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-purple-800">
                Honorários Aliança Fiscal:
              </span>
              <p className="font-bold text-purple-900">R$ {formatCurrency(data.feesValue)}</p>
            </div>
          </div>
        )}

        {/* Total Value Section */}
        <div className="bg-gradient-to-r from-af-blue-700 to-af-blue-800 p-3 rounded text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">
                Valor Total:
              </h3>
              <p className="text-xs opacity-80">Incluindo reduções</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">
                R$ {formatCurrency(data.discountedValue)}
              </p>
              <div className="text-af-green-300 text-xs">
                Economia de {data.discountPercentage || '0'}%
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="pt-2 flex justify-end gap-2">
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

export default MiniProposalCard;
