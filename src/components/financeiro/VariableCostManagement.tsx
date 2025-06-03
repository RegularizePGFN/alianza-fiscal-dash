
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Custos Variáveis</CardTitle>
              <CardDescription>
                Gerencie custos com datas específicas (parcelas, funcionários temporários, etc.)
              </CardDescription>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Custo Variável
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
          <div className="mb-6">
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
        
        <VariableCostList
          costs={costs}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleCostDeleted}
          selectedMonth={selectedMonth}
        />
      </CardContent>
    </Card>
  );
}
