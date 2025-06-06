
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sale, PaymentMethod } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowUpDown, ArrowUp, ArrowDown, Users } from "lucide-react";

interface ReportsTeamConsolidatedCardProps {
  salesData: Sale[];
  loading: boolean;
  error: Error | null;
}

interface SalespersonStats {
  id: string;
  name: string;
  pixTotal: number;
  pixCount: number;
  boletoTotal: number;
  boletoCount: number;
  creditTotal: number;
  creditCount: number;
  total: number;
  totalCount: number;
}

type SortColumn = 'name' | 'pixTotal' | 'boletoTotal' | 'creditTotal' | 'total' | 'pixCount' | 'boletoCount' | 'creditCount' | 'totalCount';
type SortDirection = 'asc' | 'desc';

export function ReportsTeamConsolidatedCard({ salesData, loading, error }: ReportsTeamConsolidatedCardProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedSalespeople, setSelectedSalespeople] = useState<string[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (column !== sortColumn) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const handleSalespersonSelection = (salespersonId: string) => {
    setSelectedSalespeople(prev => {
      if (prev.includes(salespersonId)) {
        return prev.filter(id => id !== salespersonId);
      } else {
        return [...prev, salespersonId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedSalespeople([]);
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
        pixCount: 0,
        boletoTotal: 0,
        boletoCount: 0,
        creditTotal: 0,
        creditCount: 0,
        total: 0,
        totalCount: 0
      };
    }

    const amount = sale.gross_amount || 0;
    
    switch (sale.payment_method) {
      case PaymentMethod.PIX:
        acc[salespersonId].pixTotal += amount;
        acc[salespersonId].pixCount += 1;
        break;
      case PaymentMethod.BOLETO:
        acc[salespersonId].boletoTotal += amount;
        acc[salespersonId].boletoCount += 1;
        break;
      case PaymentMethod.CREDIT:
      case PaymentMethod.DEBIT:
        acc[salespersonId].creditTotal += amount;
        acc[salespersonId].creditCount += 1;
        break;
    }
    
    acc[salespersonId].total += amount;
    acc[salespersonId].totalCount += 1;
    
    return acc;
  }, {} as Record<string, SalespersonStats>);

  let allSalespeople = Object.values(salespeopleStats);

  // Filtrar vendedores selecionados se houver seleção
  if (selectedSalespeople.length > 0) {
    allSalespeople = allSalespeople.filter(person => selectedSalespeople.includes(person.id));
  }

  // Ordenar dados
  const sortedSalespeople = [...allSalespeople].sort((a, b) => {
    let aValue = a[sortColumn];
    let bValue = b[sortColumn];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Calcular totais gerais (apenas dos vendedores exibidos)
  const totals = sortedSalespeople.reduce(
    (acc, person) => ({
      pixTotal: acc.pixTotal + person.pixTotal,
      pixCount: acc.pixCount + person.pixCount,
      boletoTotal: acc.boletoTotal + person.boletoTotal,
      boletoCount: acc.boletoCount + person.boletoCount,
      creditTotal: acc.creditTotal + person.creditTotal,
      creditCount: acc.creditCount + person.creditCount,
      total: acc.total + person.total,
      totalCount: acc.totalCount + person.totalCount
    }),
    { 
      pixTotal: 0, 
      pixCount: 0, 
      boletoTotal: 0, 
      boletoCount: 0, 
      creditTotal: 0, 
      creditCount: 0, 
      total: 0, 
      totalCount: 0 
    }
  );

  // Lista de todos os vendedores para seleção
  const allAvailableSalespeople = Object.values(salespeopleStats);

  if (allAvailableSalespeople.length === 0) {
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
          <div className="flex items-center gap-4">
            {/* Seletor de vendedores */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Select onValueChange={handleSalespersonSelection}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar vendedores" />
                </SelectTrigger>
                <SelectContent>
                  {allAvailableSalespeople.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSalespeople.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSelection}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Limpar ({selectedSalespeople.length})
              </Button>
            )}
            
            <Badge variant="outline" className="ml-2">
              {sortedSalespeople.length} vendedor(es)
              {selectedSalespeople.length > 0 && ` de ${allAvailableSalespeople.length}`}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left border-r">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium hover:bg-transparent"
                    onClick={() => handleSort('name')}
                  >
                    Vendedor
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="text-center border-r">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort('pixTotal')}
                    >
                      PIX
                      {getSortIcon('pixTotal')}
                    </Button>
                    <div className="text-xs text-muted-foreground">Valor | Qtd</div>
                  </div>
                </TableHead>
                <TableHead className="text-center border-r">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort('boletoTotal')}
                    >
                      Boleto
                      {getSortIcon('boletoTotal')}
                    </Button>
                    <div className="text-xs text-muted-foreground">Valor | Qtd</div>
                  </div>
                </TableHead>
                <TableHead className="text-center border-r">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort('creditTotal')}
                    >
                      Crédito
                      {getSortIcon('creditTotal')}
                    </Button>
                    <div className="text-xs text-muted-foreground">Valor | Qtd</div>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent"
                      onClick={() => handleSort('total')}
                    >
                      Total
                      {getSortIcon('total')}
                    </Button>
                    <div className="text-xs text-muted-foreground">Valor | Qtd</div>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSalespeople.map((person) => (
                <TableRow 
                  key={person.id} 
                  className={`hover:bg-muted/50 ${selectedSalespeople.includes(person.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                  onClick={() => handleSalespersonSelection(person.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell className="font-medium border-r">
                    {person.name}
                  </TableCell>
                  <TableCell className="text-center border-r">
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(person.pixTotal)}</div>
                      <div className="text-xs text-muted-foreground">{person.pixCount} vendas</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center border-r">
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(person.boletoTotal)}</div>
                      <div className="text-xs text-muted-foreground">{person.boletoCount} vendas</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center border-r">
                    <div className="space-y-1">
                      <div className="font-medium">{formatCurrency(person.creditTotal)}</div>
                      <div className="text-xs text-muted-foreground">{person.creditCount} vendas</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    <div className="space-y-1">
                      <div className="font-bold text-primary">{formatCurrency(person.total)}</div>
                      <div className="text-xs text-muted-foreground">{person.totalCount} vendas</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Linha de totais */}
              <TableRow className="border-t-2 bg-muted/30 font-semibold">
                <TableCell className="font-bold border-r">
                  TOTAL GERAL
                </TableCell>
                <TableCell className="text-center font-bold border-r">
                  <div className="space-y-1">
                    <div>{formatCurrency(totals.pixTotal)}</div>
                    <div className="text-xs">{totals.pixCount} vendas</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold border-r">
                  <div className="space-y-1">
                    <div>{formatCurrency(totals.boletoTotal)}</div>
                    <div className="text-xs">{totals.boletoCount} vendas</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold border-r">
                  <div className="space-y-1">
                    <div>{formatCurrency(totals.creditTotal)}</div>
                    <div className="text-xs">{totals.creditCount} vendas</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold text-primary">
                  <div className="space-y-1">
                    <div>{formatCurrency(totals.total)}</div>
                    <div className="text-xs">{totals.totalCount} vendas</div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {selectedSalespeople.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Comparativo selecionado:</strong> {selectedSalespeople.length} vendedor(es)
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Clique em um vendedor para remover da seleção ou use "Limpar" para remover todos
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
