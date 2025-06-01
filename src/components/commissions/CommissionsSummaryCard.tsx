
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCommissionsSummary } from "./hooks/useCommissionsSummary";

interface CommissionsSummaryCardProps {
  selectedMonth: number;
  selectedYear: number;
}

export function CommissionsSummaryCard({ selectedMonth, selectedYear }: CommissionsSummaryCardProps) {
  const { summary, loading } = useCommissionsSummary(selectedMonth, selectedYear);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Comissões</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Resumo de Comissões - {selectedMonth}/{selectedYear}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {summary.totalSales}
            </div>
            <div className="text-sm text-blue-600">Total de Vendas</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              R$ {summary.totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-green-600">Valor Bruto Total</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              R$ {summary.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-purple-600">Total de Comissões</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {summary.totalSalespeople}
            </div>
            <div className="text-sm text-orange-600">Vendedores Ativos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
