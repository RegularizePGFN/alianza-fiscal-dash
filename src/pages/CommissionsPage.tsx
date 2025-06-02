
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { SalesSummaryCard } from "@/components/dashboard/SalesSummaryCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCommissionsData } from "@/hooks/useCommissionsData";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";

export default function CommissionsPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  // Get commission data for the selected month
  const { salespeople, summaryTotals, loading } = useCommissionsData({ selectedMonth });

  // Generate month options (last 12 months + current month)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 12; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  // Calculate metrics
  const totalSalespeopleWithSales = salespeople.filter(p => p.totalSales > 0).length;
  const averageCommission = salespeople.length > 0 
    ? summaryTotals.projectedCommission / salespeople.length 
    : 0;
  const topPerformer = salespeople.reduce((top, current) => 
    current.projectedCommission > top.projectedCommission ? current : top, 
    { projectedCommission: 0, name: 'N/A' }
  );
  const salespeopleAboveGoal = salespeople.filter(p => p.goalPercentage >= 100).length;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto print:m-4">
        <div className="space-y-6 p-0">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden print:hidden transition-colors duration-300">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Comissões
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Histórico e informações detalhadas de comissões dos vendedores
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SalesSummaryCard
              title="Comissão Total"
              amount={summaryTotals.projectedCommission}
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
              description={`${totalSalespeopleWithSales} de ${salespeople.length} vendedores com vendas`}
            />
            
            <SalesSummaryCard
              title="Acima da Meta"
              numericValue={salespeopleAboveGoal}
              hideAmount={true}
              icon={<Target className="h-4 w-4" />}
              description={`${salespeopleAboveGoal} vendedores atingiram a meta`}
            />
          </div>

          {/* Top Performer Card */}
          {topPerformer.projectedCommission > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Maior Comissão do Período
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {topPerformer.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {topPerformer.projectedCommission.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    Comissão projetada
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Commission Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 print:break-inside-avoid print:mb-10 transition-colors duration-300">
            <SalespeopleCommissionsCard key={selectedMonth} selectedMonth={selectedMonth} />
          </div>

          {/* Additional Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informações sobre Comissões
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Estrutura de Comissões
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                  <li>• Até R$ 10.000: 15% de comissão</li>
                  <li>• Acima de R$ 10.000: 25% de comissão</li>
                  <li>• Meta individual baseada em dias úteis</li>
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
                  {salespeople.length} vendedores cadastrados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
