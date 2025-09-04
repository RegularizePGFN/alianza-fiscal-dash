
import { FixedCostManagement } from "./FixedCostManagement";
import { VariableCostManagement } from "./VariableCostManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, TrendingUp } from "lucide-react";

interface CostManagementProps {
  onCostChange: () => void;
}

export function CostManagement({ onCostChange }: CostManagementProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Gerenciamento de Custos</h2>
        <p className="text-muted-foreground">
          Organize e monitore todos os custos da empresa de forma centralizada
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Building className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-emerald-700 dark:text-emerald-300">
                  Custos Fixos
                </CardTitle>
                <CardDescription>
                  Despesas recorrentes mensais (aluguel, salários, etc.)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FixedCostManagement onCostChange={onCostChange} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-blue-700 dark:text-blue-300">
                  Custos Variáveis
                </CardTitle>
                <CardDescription>
                  Despesas com datas específicas (parcelas, temporários, etc.)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <VariableCostManagement onCostChange={onCostChange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
