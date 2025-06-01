
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useProposalsReportsData } from "../hooks/useProposalsReportsData";
import { useProposalsChartsData } from "../hooks/useProposalsChartsData";
import { MonthlyProposalsChart } from "@/components/proposals/dashboard/charts/MonthlyProposalsChart";
import { SalespeopleProposalsChart } from "@/components/proposals/dashboard/charts/SalespeopleProposalsChart";

export function ProposalsReportsTab() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { proposalsData, summary, loading } = useProposalsReportsData(selectedMonth, selectedYear);
  const { dailyProposalsData, userProposalsData } = useProposalsChartsData(proposalsData, selectedMonth, selectedYear);

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const years = [2023, 2024, 2025, 2026];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 transition-colors duration-300">
        <h3 className="text-lg font-medium mb-4">Filtros do Relatório</h3>
        <div className="flex gap-4">
          <div className="min-w-[120px]">
            <label className="block text-sm font-medium mb-2">Mês</label>
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="min-w-[100px]">
            <label className="block text-sm font-medium mb-2">Ano</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Resumo das Propostas */}
      <Card>
        <CardHeader>
          <CardTitle>
            Resumo de Propostas - {months.find(m => m.value === selectedMonth)?.label}/{selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {summary.totalProposals}
                </div>
                <div className="text-sm text-blue-600">Total de Propostas</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  R$ {summary.totalFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-green-600">Total de Honorários</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  R$ {summary.averageFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-purple-600">Honorários Médios</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {summary.activeSalespeople}
                </div>
                <div className="text-sm text-orange-600">Vendedores Ativos</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  R$ {summary.totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-red-600">Dívida Total</div>
              </div>

              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">
                  R$ {summary.totalDiscountedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-teal-600">Valor com Desconto</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráficos e Análises */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 transition-colors duration-300">
        <h3 className="text-lg font-medium mb-4">Gráficos e Análises</h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <MonthlyProposalsChart 
              dailyProposalsData={dailyProposalsData} 
              summaryStats={{
                total: summary.totalProposals,
                totalFees: summary.totalFees,
                averageFees: summary.averageFees
              }}
            />
            
            <SalespeopleProposalsChart 
              userProposalsData={userProposalsData}
            />
          </div>
        )}
      </div>

      {/* Tabela Detalhada das Propostas */}
      <Card>
        <CardHeader>
          <CardTitle>Propostas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : proposalsData.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Nenhuma proposta encontrada para o período selecionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Vendedor</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">CNPJ</th>
                    <th className="text-left p-2">Dívida Total</th>
                    <th className="text-left p-2">Valor com Desconto</th>
                    <th className="text-left p-2">Honorários</th>
                  </tr>
                </thead>
                <tbody>
                  {proposalsData.map((proposal) => (
                    <tr key={proposal.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-2">{proposal.user_name}</td>
                      <td className="p-2">{proposal.client_name || '-'}</td>
                      <td className="p-2">{proposal.cnpj || '-'}</td>
                      <td className="p-2">
                        R$ {(proposal.total_debt || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2">
                        R$ {(proposal.discounted_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2">
                        R$ {(proposal.fees_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
