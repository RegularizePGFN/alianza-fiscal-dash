
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { CostForm } from "./CostForm";
import { CostList } from "./CostList";
import { useCosts } from "@/hooks/financeiro/useCosts";

interface CostManagementProps {
  onCostChange: () => void;
}

export function CostManagement({ onCostChange }: CostManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCost, setEditingCost] = useState<any>(null);
  const { costs, loading, fetchCosts } = useCosts();

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
            <div>
              <CardTitle>Gerenciar Custos</CardTitle>
              <CardDescription>
                Adicione e gerencie os custos fixos e variáveis da empresa
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Custo
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
          
          <CostList
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
