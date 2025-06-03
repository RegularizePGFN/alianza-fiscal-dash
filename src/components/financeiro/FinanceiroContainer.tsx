
import { useState } from "react";
import { FinanceiroHeader } from "./FinanceiroHeader";
import { CostManagement } from "./CostManagement";
import { LucroLiquido } from "./LucroLiquido";
import { ResultProjection } from "./ResultProjection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSalesData } from "@/hooks/financeiro/useSalesData";

export function FinanceiroContainer() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { salesData } = useSalesData();

  const handleCostChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Calcular vendas atuais do mês selecionado
  const currentMonthSales = salesData
    .filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() + 1 === selectedMonth && saleDate.getFullYear() === selectedYear;
    })
    .reduce((total, sale) => total + Number(sale.gross_amount), 0);

  return (
    <div className="space-y-6">
      <FinanceiroHeader />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projection">Projeção de Resultados</TabsTrigger>
          <TabsTrigger value="costs">Gerenciar Custos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <LucroLiquido 
            refreshTrigger={refreshTrigger} 
            detailed 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
        </TabsContent>
        
        <TabsContent value="projection" className="space-y-6">
          <ResultProjection
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            currentSales={currentMonthSales}
          />
        </TabsContent>
        
        <TabsContent value="costs">
          <CostManagement onCostChange={handleCostChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
