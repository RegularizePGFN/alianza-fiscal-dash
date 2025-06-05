
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sale, PaymentMethod } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ReportsTeamConsolidatedCardProps {
  salesData: Sale[];
  loading: boolean;
  error: Error | null;
}

interface SalespersonStats {
  id: string;
  name: string;
  pixTotal: number;
  boletoTotal: number;
  creditTotal: number;
  total: number;
}

export function ReportsTeamConsolidatedCard({ salesData, loading, error }: ReportsTeamConsolidatedCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Consolidado Equipe</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Consolidado Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-4">
            Erro ao carregar dados: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar vendas por vendedor e método de pagamento
  const salespeopleStats = salesData.reduce((acc, sale) => {
    const salespersonId = sale.salesperson_id;
    const salespersonName = sale.salesperson_name;
    
    if (!acc[salespersonId]) {
      acc[salespersonId] = {
        id: salespersonId,
        name: salespersonName,
        pixTotal: 0,
        boletoTotal: 0,
        creditTotal: 0,
        total: 0
      };
    }

    const amount = sale.gross_amount || 0;
    
    switch (sale.payment_method) {
      case PaymentMethod.PIX:
        acc[salespersonId].pixTotal += amount;
        break;
      case PaymentMethod.BOLETO:
        acc[salespersonId].boletoTotal += amount;
        break;
      case PaymentMethod.CREDIT:
      case PaymentMethod.DEBIT:
        acc[salespersonId].creditTotal += amount;
        break;
    }
    
    acc[salespersonId].total += amount;
    
    return acc;
  }, {} as Record<string, SalespersonStats>);

  const sortedSalespeople = Object.values(salespeopleStats).sort((a, b) => b.total - a.total);

  // Calcular totais gerais
  const totals = sortedSalespeople.reduce(
    (acc, person) => ({
      pixTotal: acc.pixTotal + person.pixTotal,
      boletoTotal: acc.boletoTotal + person.boletoTotal,
      creditTotal: acc.creditTotal + person.creditTotal,
      total: acc.total + person.total
    }),
    { pixTotal: 0, boletoTotal: 0, creditTotal: 0, total: 0 }
  );

  if (sortedSalespeople.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Consolidado Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma venda encontrada no período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Consolidado Equipe</span>
          <Badge variant="outline" className="ml-2">
            {sortedSalespeople.length} vendedor(es)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Vendedor</TableHead>
                <TableHead className="text-center">PIX</TableHead>
                <TableHead className="text-center">Boleto</TableHead>
                <TableHead className="text-center">Crédito</TableHead>
                <TableHead className="text-center font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSalespeople.map((person) => (
                <TableRow key={person.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {person.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(person.pixTotal)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(person.boletoTotal)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(person.creditTotal)}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {formatCurrency(person.total)}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Linha de totais */}
              <TableRow className="border-t-2 bg-muted/30 font-semibold">
                <TableCell className="font-bold">
                  TOTAL GERAL
                </TableCell>
                <TableCell className="text-center font-bold">
                  {formatCurrency(totals.pixTotal)}
                </TableCell>
                <TableCell className="text-center font-bold">
                  {formatCurrency(totals.boletoTotal)}
                </TableCell>
                <TableCell className="text-center font-bold">
                  {formatCurrency(totals.creditTotal)}
                </TableCell>
                <TableCell className="text-center font-bold text-primary">
                  {formatCurrency(totals.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
