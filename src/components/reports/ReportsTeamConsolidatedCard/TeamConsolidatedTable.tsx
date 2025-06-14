
import { Table, TableBody, TableHead, TableHeader, TableRow, TableWithBorders, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SalespersonStats, SortColumn, SortDirection } from "./types";

interface TeamConsolidatedTableProps {
  sortedSalespeople: SalespersonStats[];
  appliedSelectedSalespeople: string[];
  totals: {
    pixTotal: number;
    pixCount: number;
    boletoTotal: number;
    boletoCount: number;
    creditTotal: number;
    creditCount: number;
    total: number;
    totalCount: number;
  };
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

export function TeamConsolidatedTable({
  sortedSalespeople,
  appliedSelectedSalespeople,
  totals,
  sortColumn,
  sortDirection,
  onSort
}: TeamConsolidatedTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSortIcon = (column: SortColumn) => {
    if (column !== sortColumn) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  // Tailwind classes para colorir as colunas pelo método de pagamento
  const pixCol = "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200";
  const boletoCol = "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200";
  const creditCol = "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
  const totalCol = "bg-primary/10 dark:bg-primary/20 text-primary font-bold";
  const totalRow = "bg-primary/20 dark:bg-primary/40";

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableWithBorders.Head className="text-left">
              <Button
                variant="ghost"
                className="h-auto p-0 font-medium hover:bg-transparent"
                onClick={() => onSort('name')}
              >
                Vendedor
                {getSortIcon('name')}
              </Button>
            </TableWithBorders.Head>
            <TableWithBorders.Head className={`text-center ${pixCol}`}>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                  onClick={() => onSort('pixTotal')}
                >
                  PIX Valor
                  {getSortIcon('pixTotal')}
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                  onClick={() => onSort('pixCount')}
                >
                  PIX Qtd
                  {getSortIcon('pixCount')}
                </Button>
              </div>
            </TableWithBorders.Head>
            <TableWithBorders.Head className={`text-center ${boletoCol}`}>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                  onClick={() => onSort('boletoTotal')}
                >
                  Boleto Valor
                  {getSortIcon('boletoTotal')}
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                  onClick={() => onSort('boletoCount')}
                >
                  Boleto Qtd
                  {getSortIcon('boletoCount')}
                </Button>
              </div>
            </TableWithBorders.Head>
            <TableWithBorders.Head className={`text-center ${creditCol}`}>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                  onClick={() => onSort('creditTotal')}
                >
                  Crédito Valor
                  {getSortIcon('creditTotal')}
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-medium hover:bg-transparent text-xs"
                  onClick={() => onSort('creditCount')}
                >
                  Crédito Qtd
                  {getSortIcon('creditCount')}
                </Button>
              </div>
            </TableWithBorders.Head>
            <TableHead className={`text-center font-semibold ${totalCol}`}>
              <div className="grid grid-cols-2 gap-1">
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent text-xs"
                  onClick={() => onSort('total')}
                >
                  Total Valor
                  {getSortIcon('total')}
                </Button>
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-semibold hover:bg-transparent text-xs"
                  onClick={() => onSort('totalCount')}
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
              <TableWithBorders.Cell className="font-medium">
                {person.name}
              </TableWithBorders.Cell>
              <TableWithBorders.Cell className={`text-center ${pixCol}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium text-sm">{formatCurrency(person.pixTotal)}</div>
                  <div className="text-sm text-muted-foreground">{person.pixCount}</div>
                </div>
              </TableWithBorders.Cell>
              <TableWithBorders.Cell className={`text-center ${boletoCol}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium text-sm">{formatCurrency(person.boletoTotal)}</div>
                  <div className="text-sm text-muted-foreground">{person.boletoCount}</div>
                </div>
              </TableWithBorders.Cell>
              <TableWithBorders.Cell className={`text-center ${creditCol}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium text-sm">{formatCurrency(person.creditTotal)}</div>
                  <div className="text-sm text-muted-foreground">{person.creditCount}</div>
                </div>
              </TableWithBorders.Cell>
              <TableCell className={`text-center font-semibold ${totalCol}`}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-bold text-primary text-sm">{formatCurrency(person.total)}</div>
                  <div className="text-sm text-muted-foreground">{person.totalCount}</div>
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {/* Linha de totais */}
          <TableRow className={`border-t-2 font-semibold ${totalRow}`}>
            <TableWithBorders.Cell className="font-bold">
              TOTAL GERAL
            </TableWithBorders.Cell>
            <TableWithBorders.Cell className={`text-center font-bold ${pixCol}`}>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">{formatCurrency(totals.pixTotal)}</div>
                <div className="text-sm">{totals.pixCount}</div>
              </div>
            </TableWithBorders.Cell>
            <TableWithBorders.Cell className={`text-center font-bold ${boletoCol}`}>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">{formatCurrency(totals.boletoTotal)}</div>
                <div className="text-sm">{totals.boletoCount}</div>
              </div>
            </TableWithBorders.Cell>
            <TableWithBorders.Cell className={`text-center font-bold ${creditCol}`}>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">{formatCurrency(totals.creditTotal)}</div>
                <div className="text-sm">{totals.creditCount}</div>
              </div>
            </TableWithBorders.Cell>
            <TableCell className={`text-center font-bold text-primary ${totalCol}`}>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">{formatCurrency(totals.total)}</div>
                <div className="text-sm">{totals.totalCount}</div>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

