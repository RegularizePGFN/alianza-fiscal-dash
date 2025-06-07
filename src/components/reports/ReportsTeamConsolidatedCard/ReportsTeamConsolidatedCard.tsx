
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sale, PaymentMethod } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SalespersonSelector } from "./SalespersonSelector";
import { DateFilterSelector } from "./DateFilterSelector";
import { TeamConsolidatedTable } from "./TeamConsolidatedTable";
import { ReportsTeamConsolidatedCardProps, SalespersonStats, LocalDateFilter, SortColumn, SortDirection } from "./types";

export function ReportsTeamConsolidatedCard({ salesData, loading, error }: ReportsTeamConsolidatedCardProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [appliedSelectedSalespeople, setAppliedSelectedSalespeople] = useState<string[]>([]);
  const [localDateFilter, setLocalDateFilter] = useState<LocalDateFilter | null>(null);

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleApplySelection = (selectedIds: string[]) => {
    setAppliedSelectedSalespeople(selectedIds);
  };

  const handleClearSelection = () => {
    setAppliedSelectedSalespeople([]);
  };

  const handleApplyDateFilter = (filter: LocalDateFilter | null) => {
    setLocalDateFilter(filter);
  };

  const getDateFilterLabel = () => {
    if (!localDateFilter) return "Período: Todos";
    return `${localDateFilter.startDate} - ${localDateFilter.endDate}`;
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

  // Apply local date filter to sales data
  let filteredSalesData = [...salesData];
  
  if (localDateFilter?.startDate && localDateFilter?.endDate) {
    const startDateStr = localDateFilter.startDate;
    const endDateStr = localDateFilter.endDate;
    
    filteredSalesData = filteredSalesData.filter(sale => {
      if (typeof sale.sale_date !== 'string' || !sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return false;
      }
      return sale.sale_date >= startDateStr && sale.sale_date <= endDateStr;
    });
  }

  console.log("🔍 DEBUG - Investigando divergência de valores:");
  console.log("📊 Total de vendas recebidas:", salesData.length);
  console.log("📊 Vendas após filtro:", filteredSalesData.length);
  
  // Agrupar vendas por vendedor e método de pagamento
  const salespeopleStats = filteredSalesData.reduce((acc, sale) => {
    const salespersonId = sale.salesperson_id;
    const salespersonName = sale.salesperson_name;
    
    console.log(`🧮 Processando venda: ${sale.id} - Vendedor: ${salespersonName} - Valor: ${sale.gross_amount}`);
    
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
  
  console.log("👥 Vendedores processados:", allSalespeople.map(p => ({
    name: p.name,
    total: p.total,
    salesCount: p.totalCount
  })));

  // Filtrar vendedores selecionados se houver seleção aplicada
  if (appliedSelectedSalespeople.length > 0) {
    allSalespeople = allSalespeople.filter(person => appliedSelectedSalespeople.includes(person.id));
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

  // Lista de todos os vendedores para seleção (baseada nos dados originais)
  const allAvailableSalespeople = Object.values(salesData.reduce((acc, sale) => {
    if (!acc[sale.salesperson_id]) {
      acc[sale.salesperson_id] = {
        id: sale.salesperson_id,
        name: sale.salesperson_name
      };
    }
    return acc;
  }, {} as Record<string, { id: string; name: string }>));

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
            <SalespersonSelector
              allAvailableSalespeople={allAvailableSalespeople}
              appliedSelectedSalespeople={appliedSelectedSalespeople}
              onApplySelection={handleApplySelection}
              onClearSelection={handleClearSelection}
            />

            <DateFilterSelector
              localDateFilter={localDateFilter}
              onApplyDateFilter={handleApplyDateFilter}
            />
            
            {appliedSelectedSalespeople.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearSelection}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Limpar Filtros ({appliedSelectedSalespeople.length})
              </Button>
            )}
            
            <Badge variant="outline" className="ml-2">
              {sortedSalespeople.length} vendedor(es)
              {appliedSelectedSalespeople.length > 0 && ` de ${allAvailableSalespeople.length}`}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TeamConsolidatedTable
          sortedSalespeople={sortedSalespeople}
          appliedSelectedSalespeople={appliedSelectedSalespeople}
          totals={totals}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        
        {(appliedSelectedSalespeople.length > 0 || localDateFilter) && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              {appliedSelectedSalespeople.length > 0 && (
                <div><strong>Comparativo selecionado:</strong> {appliedSelectedSalespeople.length} vendedor(es)</div>
              )}
              {localDateFilter && (
                <div><strong>Período filtrado:</strong> {getDateFilterLabel()}</div>
              )}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Use os seletores acima para modificar as configurações
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
