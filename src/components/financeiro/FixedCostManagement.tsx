
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
      <Card className="border-green-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-800 dark:text-green-200 text-lg">Custos Fixos</CardTitle>
                <CardDescription className="text-green-600 dark:text-green-300 text-sm">
                  Gerencie custos recorrentes mensais (aluguel, salários, etc.)
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Custo Fixo
            </Button>
          </div>
        </CardHeader>
        
        {showForm && (
          <CardContent className="border-t bg-gray-50 dark:bg-gray-800/50 p-4">
            <CostForm
              cost={editingCost}
              costType="fixed"
              onSave={handleCostSaved}
              onCancel={() => {
                setShowForm(false);
                setEditingCost(null);
              }}
            />
          </CardContent>
        )}
      </Card>
      
      <FixedCostList
        costs={costs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleCostDeleted}
      />
    </div>
  );
}
