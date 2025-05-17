
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, ArrowRight } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
}

const ProposalCard = ({ data }: ProposalCardProps) => {
  const generatePdf = () => {
    // This would normally call a PDF generation library
    alert("PDF generation functionality would go here");
  };

  const printProposal = () => {
    window.print();
  };

  return (
    <Card className="border-border max-w-4xl mx-auto shadow-lg bg-gradient-to-br from-af-blue-50 to-white overflow-hidden">
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
              Proposta de Parcelamento PGFN
            </CardTitle>
          </div>
          <Badge className="bg-af-green-500 hover:bg-af-green-400 text-white text-sm py-1.5 px-3">
            Economia de R$ {data.discountedValue || '0,00'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-8 px-8 pb-8">
        {/* Contribuinte Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800">
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
          <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800">
            Dados da Negociação
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700">Valor Consolidado:</span>
              <p className="text-lg">R$ {data.totalDebt || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100 bg-gradient-to-br from-af-green-50 to-white">
              <span className="font-medium text-af-green-700">Valor com Reduções:</span>
              <p className="text-lg font-bold text-af-green-700">R$ {data.discountedValue || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700">Percentual de Desconto:</span>
              <p className="text-lg">{data.discountPercentage || '-'}%</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700">Valor da Entrada:</span>
              <p className="text-lg">R$ {data.entryValue || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700">Número de Parcelas:</span>
              <p className="text-lg">{data.installments || '-'}</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100">
              <span className="font-medium text-af-blue-700">Valor das Parcelas:</span>
              <p className="text-lg">R$ {data.installmentValue || '-'}</p>
            </div>
          </div>
        </div>

        {/* Fees Section */}
        {data.feesValue && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-af-blue-200 pb-2 text-af-blue-800">
              Custos e Honorários
            </h3>
            <div className="bg-white p-4 rounded-md shadow-sm border border-af-blue-100 max-w-xs">
              <span className="font-medium text-af-blue-700">Honorários Aliança Fiscal:</span>
              <p className="text-lg">R$ {data.feesValue}</p>
            </div>
          </div>
        )}

        {/* Total Value Section */}
        <div className="mt-8 bg-gradient-to-r from-af-blue-700 to-af-blue-800 p-6 rounded-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-1">Valor Total:</h3>
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
        <div className="bg-white p-5 rounded-lg border border-af-blue-200">
          <h3 className="text-lg font-semibold text-af-blue-800 mb-4">Opções de Pagamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-af-blue-100 rounded p-4">
              <p className="font-medium text-af-blue-700">À Vista</p>
              <p className="text-lg font-bold">R$ {data.discountedValue || '0,00'}</p>
            </div>
            <div className="border border-af-blue-100 rounded p-4">
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
