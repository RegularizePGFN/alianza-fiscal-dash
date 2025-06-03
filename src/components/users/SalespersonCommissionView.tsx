
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalesSummaryCard } from "@/components/dashboard/SalesSummaryCard";
import { DollarSign, BarChart3, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { calculateCommission } from "@/lib/utils";
import { CONTRACT_TYPE_CLT, CONTRACT_TYPE_PJ } from "@/lib/constants";

interface SalespersonCommissionViewProps {
  userId: string;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthOptions: { value: string; label: string }[];
}

interface SalespersonData {
  projectedCommission: number;
  totalSales: number;
  salesCount: number;
  goalPercentage: number;
  goalAmount: number;
  metaGap: number;
  zeroDaysCount: number;
  contractType: string;
}

export function SalespersonCommissionView({ 
  userId, 
  selectedMonth, 
  onMonthChange, 
  monthOptions 
}: SalespersonCommissionViewProps) {
  const [salespersonData, setSalespersonData] = useState<SalespersonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalespersonData = async () => {
      try {
        setLoading(true);
        
        const [year, month] = selectedMonth.split('-').map(Number);
        
        // Get sales for the selected month
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        
        const { data: salesData, error: salesError } = await supabase
          .from("sales")
          .select("*")
          .eq("salesperson_id", userId)
          .gte("sale_date", startDate)
          .lte("sale_date", endDate);
          
        if (salesError) throw salesError;
        
        // Get monthly goal
        const { data: goalData } = await supabase
          .from("monthly_goals")
          .select("goal_amount")
          .eq("user_id", userId)
          .eq("month", month)
          .eq("year", year)
          .maybeSingle();
          
        // Get profile to check contract type
        const { data: profile } = await supabase
          .from("profiles")
          .select("contract_type")
          .eq("id", userId)
          .single();
          
        const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.gross_amount), 0) || 0;
        const salesCount = salesData?.length || 0;
        const goalAmount = goalData?.goal_amount ? Number(goalData.goal_amount) : 0;
        const contractType = profile?.contract_type || CONTRACT_TYPE_PJ;
        
        // Calculate commission using the correct contract type
        const commission = calculateCommission(totalSales, contractType);
        
        const goalPercentage = goalAmount > 0 ? (totalSales / goalAmount) * 100 : 0;
        
        setSalespersonData({
          projectedCommission: commission.amount,
          totalSales,
          salesCount,
          goalPercentage,
          goalAmount,
          metaGap: totalSales - goalAmount,
          zeroDaysCount: 0, // Not calculated for historical data
          contractType
        });
        
      } catch (error) {
        console.error("Error fetching salesperson data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalespersonData();
  }, [userId, selectedMonth]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando dados...</p>
      </div>
    );
  }

  if (!salespersonData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum dado encontrado para o período selecionado</p>
      </div>
    );
  }

  // Get the current commission rate based on sales and contract type
  const getCurrentCommissionInfo = () => {
    const isCLT = salespersonData.contractType === CONTRACT_TYPE_CLT;
    const isAboveGoal = salespersonData.totalSales >= 10000;
    
    if (isCLT) {
      return {
        currentRate: isAboveGoal ? 10 : 5,
        belowGoalRate: 5,
        aboveGoalRate: 10,
        contractLabel: 'CLT'
      };
    } else {
      return {
        currentRate: isAboveGoal ? 25 : 20,
        belowGoalRate: 20,
        aboveGoalRate: 25,
        contractLabel: 'PJ'
      };
    }
  };

  const commissionInfo = getCurrentCommissionInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Minhas Comissões
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Histórico e informações detalhadas das suas comissões
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SalesSummaryCard
          title="Minha Comissão"
          amount={salespersonData.projectedCommission}
          icon={<DollarSign className="h-4 w-4" />}
          description={`Sua comissão (${commissionInfo.currentRate}% - ${commissionInfo.contractLabel})`}
        />
        
        <SalesSummaryCard
          title="Total de Vendas"
          amount={salespersonData.totalSales}
          icon={<BarChart3 className="h-4 w-4" />}
          description="Valor total das suas vendas"
        />
        
        <SalesSummaryCard
          title="Número de Vendas"
          numericValue={salespersonData.salesCount}
          hideAmount={true}
          icon={<Target className="h-4 w-4" />}
          description="Quantidade de vendas realizadas"
        />
        
        <SalesSummaryCard
          title="Progresso da Meta"
          numericValue={Math.round(salespersonData.goalPercentage)}
          hideAmount={true}
          icon={<TrendingUp className="h-4 w-4" />}
          description={`${Math.round(salespersonData.goalPercentage)}% da meta atingida`}
        />
      </div>

      {/* Detailed Performance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Desempenho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Meta Individual</h4>
              <p className="text-2xl font-bold text-blue-600">
                {salespersonData.goalAmount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
              <p className="text-sm text-gray-500">Meta definida para o período</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Gap da Meta</h4>
              <p className={`text-2xl font-bold ${salespersonData.metaGap >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salespersonData.metaGap >= 0 ? '+' : ''}
                {salespersonData.metaGap.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
              <p className="text-sm text-gray-500">
                {salespersonData.metaGap >= 0 ? 'Acima da meta esperada' : 'Abaixo da meta esperada'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tipo de Contrato</h4>
              <p className="text-2xl font-bold text-purple-600">
                {commissionInfo.contractLabel}
              </p>
              <p className="text-sm text-gray-500">Tipo de contratação</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações sobre Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Estrutura de Comissões ({commissionInfo.contractLabel})
              </h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Até R$ 10.000: {commissionInfo.belowGoalRate}% de comissão</li>
                <li>• Acima de R$ 10.000: {commissionInfo.aboveGoalRate}% de comissão</li>
                <li className={`font-medium ${salespersonData.totalSales >= 10000 ? 'text-green-600' : 'text-orange-600'}`}>
                  • Sua faixa atual: {commissionInfo.currentRate}%
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Período Analisado
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR })}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Comissão calculada com base nas vendas realizadas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
