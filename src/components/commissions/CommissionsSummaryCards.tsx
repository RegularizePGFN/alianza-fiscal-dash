import { SalesSummaryCard } from "@/components/dashboard/SalesSummaryCard";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";

interface CommissionsSummaryCardsProps {
  totalSalespeopleWithSales: number;
  averageCommission: number;
  salespeopleAboveGoal: number;
  totalSalespeople: number;
  projectedCommission: number;
}

export function CommissionsSummaryCards({ 
  totalSalespeopleWithSales, 
  averageCommission, 
  salespeopleAboveGoal, 
  totalSalespeople,
  projectedCommission 
}: CommissionsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <SalesSummaryCard
        title="Comissão Total"
        amount={projectedCommission}
        icon={<DollarSign className="h-4 w-4 text-af-green-600" />}
        description="Valor total de comissões do período"
        className="shadow-lg border border-af-green-100 rounded-xl"
      />
      
      <SalesSummaryCard
        title="Comissão Média"
        amount={averageCommission}
        icon={<TrendingUp className="h-4 w-4 text-af-blue-600" />}
        description="Média de comissão por vendedor"
        className="shadow-lg border border-af-blue-100 rounded-xl"
      />
      
      <SalesSummaryCard
        title="Vendedores Ativos"
        numericValue={totalSalespeopleWithSales}
        hideAmount={true}
        icon={<Users className="h-4 w-4 text-af-blue-700" />}
        description={
          `${totalSalespeopleWithSales} de ${totalSalespeople} vendedores com vendas`
        }
        className="shadow-lg border border-af-blue-100 rounded-xl"
      />
      
      <SalesSummaryCard
        title="Acima da Meta"
        numericValue={salespeopleAboveGoal}
        hideAmount={true}
        icon={<Target className="h-4 w-4 text-af-green-600" />}
        description={`${salespeopleAboveGoal} vendedores atingiram a meta`}
        className="shadow-lg border border-af-green-100 rounded-xl"
      />
    </div>
  );
}
