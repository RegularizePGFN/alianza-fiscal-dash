
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp } from "lucide-react";
import { CostForm } from "./CostForm";
import { VariableCostList } from "./VariableCostList";
import { useVariableCosts } from "@/hooks/financeiro/useVariableCosts";

interface VariableCostManagementProps {
  onCostChange: () => void;
}

export function VariableCostManagement({ onCostChange }: VariableCostManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const { costs, loading, fetchCosts } = useVariableCosts(selectedMonth);

  const handleCostSaved = () => {
    setShowForm(false);
    setEditingCost(null);
    fetchCosts();
    onCostChange();
  };

  const handleEdit = (cost: any) => {
    setEditingCost(cost);
    setShowForm(true);
  };

  const handleCostDeleted = () => {
    fetchCosts();
    onCostChange();
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 12; i >= -6; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
      options.push({ value, label });
    }
    
    return options;
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-blue-800 dark:text-blue-200">Custos Variáveis</CardTitle>
                <CardDescription className="text-blue-600 dark:text-blue-300">
                  Gerencie custos com datas específicas (parcelas, funcionários temporários, etc.)
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Custo Variável
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium">Filtrar por mês:</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showForm && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border">
              <CostForm
                cost={editingCost}
                costType="variable"
                onSave={handleCostSaved}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCost(null);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <VariableCostList
        costs={costs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleCostDeleted}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
