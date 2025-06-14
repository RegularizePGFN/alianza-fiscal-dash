import { SalesSummaryCard } from "@/components/dashboard/SalesSummaryCard";
import { CommissionsInfoCard } from "./CommissionsInfoCard";
import { DollarSign, BarChart3, Target, TrendingUp } from "lucide-react";

interface SalespersonCommissionsViewProps {
  salespersonData: any;
  loading: boolean;
  selectedMonth: number;
  selectedYear: number;
}

export function SalespersonCommissionsView({ 
  salespersonData, 
  loading, 
  selectedMonth, 
  selectedYear 
}: SalespersonCommissionsViewProps) {
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

  return (
    <>
      {/* Personal Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        <SalesSummaryCard
          title="Minha Comissão"
          amount={salespersonData.projectedCommission}
          icon={<DollarSign className="h-4 w-4 text-af-green-600" />}
          description="Sua comissão projetada do período"
          className="shadow-lg border border-af-green-100 rounded-xl"
        />
        
        <SalesSummaryCard
          title="Total de Vendas"
          amount={salespersonData.totalSales}
          icon={<BarChart3 className="h-4 w-4 text-af-blue-500" />}
          description="Valor total das suas vendas"
          className="shadow-lg border border-af-blue-100 rounded-xl"
        />
        
        <SalesSummaryCard
          title="Número de Vendas"
          numericValue={salespersonData.salesCount}
          hideAmount={true}
          icon={<Target className="h-4 w-4 text-af-blue-700" />}
          description="Quantidade de vendas realizadas"
          className="shadow-lg border border-af-blue-100 rounded-xl"
        />
        
        <SalesSummaryCard
          title="Progresso da Meta"
          numericValue={Math.round(salespersonData.goalPercentage)}
          hideAmount={true}
          icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
          description={`${Math.round(salespersonData.goalPercentage)}% da meta atingida`}
          className="shadow-lg border border-orange-100 rounded-xl"
        />
      </div>

      {/* Detailed Performance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6 mt-8 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Detalhes do Desempenho
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Meta Individual</h4>
            <p className="text-2xl font-bold text-af-blue-600">
              {salespersonData.goalAmount.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
            <p className="text-sm text-gray-500">Meta definida para o período</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Gap da Meta</h4>
            <p className={`text-2xl font-bold ${
                salespersonData.metaGap >= 0 ? 'text-af-green-600' : 'text-red-600'
              }`}>
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
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Dias Sem Vendas</h4>
            <p className="text-2xl font-bold text-orange-500">
              {salespersonData.zeroDaysCount}
            </p>
            <p className="text-sm text-gray-500">Dias úteis sem vendas no período</p>
          </div>
        </div>
      </div>

      {/* Commission Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6 mt-8 animate-fade-in">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
          Informações sobre Comissões
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Estrutura de Comissões
            </h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li>• Até R$ 10.000: <span className="text-orange-500 font-bold">20%</span> de comissão</li>
              <li>• Acima de R$ 10.000: <span className="text-af-green-600 font-bold">25%</span> de comissão</li>
              <li className={`font-medium ${salespersonData.totalSales >= 10000 ? 'text-af-green-600' : 'text-orange-500'}`}>
                • Sua faixa atual: {salespersonData.totalSales >= 10000 ? '25%' : '20%'}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Período Analisado
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {new Intl.DateTimeFormat('pt-BR', { 
                month: 'long', 
                year: 'numeric' 
              }).format(new Date(selectedYear, selectedMonth - 1))}
            </p>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Comissão calculada com base nas vendas realizadas
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
