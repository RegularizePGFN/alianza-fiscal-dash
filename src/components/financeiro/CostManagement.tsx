
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, TrendingUp } from "lucide-react";
import { FixedCostManagement } from "./FixedCostManagement";
import { VariableCostManagement } from "./VariableCostManagement";

interface CostManagementProps {
  onCostChange: () => void;
}

export function CostManagement({ onCostChange }: CostManagementProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="fixed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixed" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Custos Fixos
          </TabsTrigger>
          <TabsTrigger value="variable" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Custos Variáveis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="fixed">
          <FixedCostManagement onCostChange={onCostChange} />
        </TabsContent>
        
        <TabsContent value="variable">
          <VariableCostManagement onCostChange={onCostChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
