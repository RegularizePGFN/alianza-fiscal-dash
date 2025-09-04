
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
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Filtros e Controles</h3>
            <p className="text-sm text-muted-foreground">Organize custos por período</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
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
          <div className="p-4 bg-muted/50 rounded-lg border">
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
      </div>
      
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
