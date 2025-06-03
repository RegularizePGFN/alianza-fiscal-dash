
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SalesSummaryCard
        title="Comissão Total"
        amount={projectedCommission}
        icon={<DollarSign className="h-4 w-4" />}
        description="Valor total de comissões do período"
      />
      
      <SalesSummaryCard
        title="Comissão Média"
        amount={averageCommission}
        icon={<TrendingUp className="h-4 w-4" />}
        description="Média de comissão por vendedor"
      />
      
      <SalesSummaryCard
        title="Vendedores Ativos"
        numericValue={totalSalespeopleWithSales}
        hideAmount={true}
        icon={<Users className="h-4 w-4" />}
        description={`${totalSalespeopleWithSales} de ${totalSalespeople} vendedores com vendas`}
      />
      
      <SalesSummaryCard
        title="Acima da Meta"
        numericValue={salespeopleAboveGoal}
        hideAmount={true}
        icon={<Target className="h-4 w-4" />}
        description={`${salespeopleAboveGoal} vendedores atingiram a meta`}
      />
    </div>
  );
}
