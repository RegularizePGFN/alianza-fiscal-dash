
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { ExtractedData } from "@/lib/types/proposals";

interface ProposalCardProps {
  data: Partial<ExtractedData>;
  imageUrl?: string;
}

const ProposalCard = ({ data, imageUrl }: ProposalCardProps) => {
  const generatePdf = () => {
    // This would normally call a PDF generation library
    alert("PDF generation functionality would go here");
  };

  const printProposal = () => {
    window.print();
  };

  return (
    <Card className="border-border max-w-3xl mx-auto">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">Proposta de Parcelamento PGFN</CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge className="bg-primary text-white">
              Economia de R$ {data.discountedValue || '0,00'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Dados do Contribuinte</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">CNPJ:</span>
              <p className="text-muted-foreground">{data.cnpj || '-'}</p>
            </div>
            <div>
              <span className="font-medium">Número do Débito:</span>
              <p className="text-muted-foreground">{data.debtNumber || '-'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Dados da Negociação</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">Valor Consolidado:</span>
              <p className="text-muted-foreground">R$ {data.totalDebt || '-'}</p>
            </div>
            <div>
              <span className="font-medium">Valor com Reduções:</span>
              <p className="text-muted-foreground">R$ {data.discountedValue || '-'}</p>
            </div>
            <div>
              <span className="font-medium">Percentual de Desconto:</span>
              <p className="text-muted-foreground">{data.discountPercentage || '-'}%</p>
            </div>
            <div>
              <span className="font-medium">Valor da Entrada:</span>
              <p className="text-muted-foreground">R$ {data.entryValue || '-'}</p>
            </div>
            <div>
              <span className="font-medium">Número de Parcelas:</span>
              <p className="text-muted-foreground">{data.installments || '-'}</p>
            </div>
            <div>
              <span className="font-medium">Valor das Parcelas:</span>
              <p className="text-muted-foreground">R$ {data.installmentValue || '-'}</p>
            </div>
          </div>
        </div>

        {data.feesValue && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Custos e Honorários</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Honorários Aliança Fiscal:</span>
                <p className="text-muted-foreground">R$ {data.feesValue}</p>
              </div>
            </div>
          </div>
        )}

        {imageUrl && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Simulação Original</h3>
            <img 
              src={imageUrl} 
              alt="Simulação PGFN" 
              className="w-full max-h-60 object-contain border rounded-md"
            />
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={printProposal}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button onClick={generatePdf}>
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalCard;
