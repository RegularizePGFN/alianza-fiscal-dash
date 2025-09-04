
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building } from "lucide-react";
import { CostForm } from "./CostForm";
import { FixedCostList } from "./FixedCostList";
import { useFixedCosts } from "@/hooks/financeiro/useFixedCosts";

interface FixedCostManagementProps {
  onCostChange: () => void;
}

export function FixedCostManagement({ onCostChange }: FixedCostManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState<any>(null);
  const { costs, loading, fetchCosts } = useFixedCosts();

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Lista de Custos</h3>
          <p className="text-sm text-muted-foreground">
            {costs.length} {costs.length === 1 ? 'custo cadastrado' : 'custos cadastrados'}
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
      
      {showForm && (
        <div className="p-4 bg-muted/50 rounded-lg border">
          <CostForm
            cost={editingCost}
            costType="fixed"
            onSave={handleCostSaved}
            onCancel={() => {
              setShowForm(false);
              setEditingCost(null);
            }}
          />
        </div>
      )}
      
      <FixedCostList
        costs={costs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleCostDeleted}
      />
    </div>
  );
}
