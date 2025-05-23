
import { formatCurrency } from "@/lib/utils";

interface MonthlySummaryProps {
  totals: {
    totalDailySales: number;
    totalCount: number;
    averageSalesAmount: number;
    averageContractsPerDay: number;
    daysWithSales: number;
    totalBusinessDays: number;
  };
}

export function MonthlySummary({ totals }: MonthlySummaryProps) {
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <h3 className="text-sm font-medium mb-2">Consolidado Mês</h3>
      
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-base font-semibold">{formatCurrency(totals.totalDailySales)}</span>
          <span className="text-xs text-muted-foreground">
            Média: {formatCurrency(totals.averageSalesAmount)}/venda
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-muted-foreground">
            {totals.totalCount} contratos em {totals.daysWithSales} de {totals.totalBusinessDays} dias úteis
          </span>
          <span className="text-xs text-muted-foreground">
            Média: {totals.averageContractsPerDay.toFixed(1)} contratos/dia
          </span>
        </div>
      </div>
    </div>
  );
}
