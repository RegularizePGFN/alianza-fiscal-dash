
import { CircleDollarSign, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SummarySectionProps {
  salesCount: number;
  salesAmount: number;
}

export function SummarySection({ salesCount, salesAmount }: SummarySectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
          <Users className="h-4 w-4 text-purple-700" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total de Vendas</p>
          <h4 className="text-lg font-bold">{salesCount}</h4>
        </div>
      </div>
      
      <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
          <CircleDollarSign className="h-4 w-4 text-purple-700" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total em Valor</p>
          <h4 className="text-lg font-bold">{formatCurrency(salesAmount)}</h4>
        </div>
      </div>
    </div>
  );
}
