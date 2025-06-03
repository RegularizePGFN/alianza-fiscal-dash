
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Custos Fixos</CardTitle>
                <CardDescription>
                  Gerencie custos recorrentes mensais (aluguel, salários, etc.)
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Custo Fixo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-6">
              <CostForm
                cost={editingCost}
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
        </CardContent>
      </Card>
    </div>
  );
}
