
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Sale, PaymentMethod, DateFilter } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowUpDown, ArrowUp, ArrowDown, Users, Check, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [tempSelectedSalespeople, setTempSelectedSalespeople] = useState<string[]>([]);
  const [appliedSelectedSalespeople, setAppliedSelectedSalespeople] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Local date filter states
  const [localDateFilter, setLocalDateFilter] = useState<DateFilter | null>(null);
  const [dateFilterType, setDateFilterType] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

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

  const handleTempSalespersonSelection = (salespersonId: string) => {
    setTempSelectedSalespeople(prev => {
      if (prev.includes(salespersonId)) {
        return prev.filter(id => id !== salespersonId);
      } else {
        return [...prev, salespersonId];
      }
    });
  };

  const applySelection = () => {
    setAppliedSelectedSalespeople(tempSelectedSalespeople);
    setIsPopoverOpen(false);
  };

  const clearSelection = () => {
    setTempSelectedSalespeople([]);
    setAppliedSelectedSalespeople([]);
    setIsPopoverOpen(false);
  };

  // Handle date filter changes
  const getDateFilterFromSelection = (): DateFilter | null => {
    if (dateFilterType === 'month') {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (selectedMonth) {
        case 'current':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'previous':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        default:
          return null;
      }

      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };
    } else if (dateFilterType === 'custom' && customStartDate && customEndDate) {
      return {
        startDate: customStartDate.toISOString().split('T')[0],
        endDate: customEndDate.toISOString().split('T')[0]
      };
    }

    return null;
  };

  const applyDateFilter = () => {
    const filter = getDateFilterFromSelection();
    setLocalDateFilter(filter);
    setIsDatePopoverOpen(false);
  };

  const clearDateFilter = () => {
    setLocalDateFilter(null);
    setDateFilterType('month');
    setSelectedMonth('current');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
    setIsDatePopoverOpen(false);
  };

  const getDateFilterLabel = () => {
    if (!localDateFilter) return "Selecionar período";
    
    if (dateFilterType === 'month') {
      switch (selectedMonth) {
        case 'current':
          return "Mês atual";
        case 'previous':
          return "Mês passado";
        default:
          return "Selecionar período";
      }
    } else if (customStartDate && customEndDate) {
      return `${format(customStartDate, "dd/MM/yy")} - ${format(customEndDate, "dd/MM/yy")}`;
    }
    
    return "Selecionar período";
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
    filteredSalesData = filteredSalesData.filter(sale => {
      if (typeof sale.sale_date !== 'string' || !sale.sale_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return false;
      }
      return sale.sale_date >= localDateFilter.startDate! && sale.sale_date <= localDateFilter.endDate!;
    });
  }

  // Agrupar vendas por vendedor e método de pagamento
  const salespeopleStats = filteredSalesData.reduce((acc, sale) => {
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
            {/* Seletor de vendedores */}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48">
                    Selecionar vendedores
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Selecionar vendedores para comparativo</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {allAvailableSalespeople.map((person) => (
                        <div key={person.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={person.id}
                            checked={tempSelectedSalespeople.includes(person.id)}
                            onCheckedChange={() => handleTempSalespersonSelection(person.id)}
                          />
                          <label htmlFor={person.id} className="text-sm cursor-pointer">
                            {person.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={clearSelection}>
                        Limpar
                      </Button>
                      <Button size="sm" onClick={applySelection}>
                        <Check className="h-4 w-4 mr-1" />
                        Aplicar ({tempSelectedSalespeople.length})
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Seletor de datas */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-48">
                    {getDateFilterLabel()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Selecionar período</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Tipo de filtro</label>
                        <Select value={dateFilterType} onValueChange={(value: 'month' | 'custom') => setDateFilterType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="month">Por mês</SelectItem>
                            <SelectItem value="custom">Data personalizada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {dateFilterType === 'month' && (
                        <div>
                          <label className="text-sm font-medium">Mês</label>
                          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="current">Mês atual</SelectItem>
                              <SelectItem value="previous">Mês passado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {dateFilterType === 'custom' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Data inicial</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !customStartDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {customStartDate ? format(customStartDate, "dd/MM/yyyy") : "Selecionar data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={customStartDate}
                                  onSelect={setCustomStartDate}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Data final</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !customEndDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {customEndDate ? format(customEndDate, "dd/MM/yyyy") : "Selecionar data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={customEndDate}
                                  onSelect={setCustomEndDate}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={clearDateFilter}>
                        Limpar
                      </Button>
                      <Button size="sm" onClick={applyDateFilter}>
                        <Check className="h-4 w-4 mr-1" />
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {appliedSelectedSalespeople.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearSelection}
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
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                      onClick={() => handleSort('pixTotal')}
                    >
                      PIX Valor
                      {getSortIcon('pixTotal')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                      onClick={() => handleSort('pixCount')}
                    >
                      PIX Qtd
                      {getSortIcon('pixCount')}
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-center border-r">
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                      onClick={() => handleSort('boletoTotal')}
                    >
                      Boleto Valor
                      {getSortIcon('boletoTotal')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                      onClick={() => handleSort('boletoCount')}
                    >
                      Boleto Qtd
                      {getSortIcon('boletoCount')}
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-center border-r">
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                      onClick={() => handleSort('creditTotal')}
                    >
                      Crédito Valor
                      {getSortIcon('creditTotal')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                      onClick={() => handleSort('creditCount')}
                    >
                      Crédito Qtd
                      {getSortIcon('creditCount')}
                    </Button>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold">
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs"
                      onClick={() => handleSort('total')}
                    >
                      Total Valor
                      {getSortIcon('total')}
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-semibold hover:bg-transparent text-xs"
                      onClick={() => handleSort('totalCount')}
                    >
                      Total Qtd
                      {getSortIcon('totalCount')}
                    </Button>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSalespeople.map((person) => (
                <TableRow 
                  key={person.id} 
                  className={`hover:bg-muted/50 ${appliedSelectedSalespeople.includes(person.id) ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                >
                  <TableCell className="font-medium border-r">
                    {person.name}
                  </TableCell>
                  <TableCell className="text-center border-r">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium text-sm">{formatCurrency(person.pixTotal)}</div>
                      <div className="text-sm text-muted-foreground">{person.pixCount}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center border-r">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium text-sm">{formatCurrency(person.boletoTotal)}</div>
                      <div className="text-sm text-muted-foreground">{person.boletoCount}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center border-r">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium text-sm">{formatCurrency(person.creditTotal)}</div>
                      <div className="text-sm text-muted-foreground">{person.creditCount}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-bold text-primary text-sm">{formatCurrency(person.total)}</div>
                      <div className="text-sm text-muted-foreground">{person.totalCount}</div>
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">{formatCurrency(totals.pixTotal)}</div>
                    <div className="text-sm">{totals.pixCount}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold border-r">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">{formatCurrency(totals.boletoTotal)}</div>
                    <div className="text-sm">{totals.boletoCount}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold border-r">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">{formatCurrency(totals.creditTotal)}</div>
                    <div className="text-sm">{totals.creditCount}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold text-primary">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">{formatCurrency(totals.total)}</div>
                    <div className="text-sm">{totals.totalCount}</div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
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
