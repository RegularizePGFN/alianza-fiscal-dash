
import { useState } from "react";
import { FinanceiroHeader } from "./FinanceiroHeader";
import { CostManagement } from "./CostManagement";
import { LucroLiquido } from "./LucroLiquido";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FinanceiroContainer() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCostChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <FinanceiroHeader />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="costs">Gerenciar Custos</TabsTrigger>
          <TabsTrigger value="profit">Lucro Líquido</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <LucroLiquido refreshTrigger={refreshTrigger} />
        </TabsContent>
        
        <TabsContent value="costs">
          <CostManagement onCostChange={handleCostChange} />
        </TabsContent>
        
        <TabsContent value="profit">
          <LucroLiquido refreshTrigger={refreshTrigger} detailed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
