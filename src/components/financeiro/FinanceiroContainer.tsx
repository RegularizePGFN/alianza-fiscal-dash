
import { useState } from "react";
import { CostManagement } from "./CostManagement";
import { LucroLiquido } from "./LucroLiquido";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCleanupCommissions } from "@/hooks/financeiro/useCleanupCommissions";

export function FinanceiroContainer() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Limpar comissões duplicadas (executar apenas uma vez)
  useCleanupCommissions();

  const handleCostChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="costs">Gerenciar Custos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <LucroLiquido 
            refreshTrigger={refreshTrigger} 
            detailed 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-4">
          <CostManagement onCostChange={handleCostChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
