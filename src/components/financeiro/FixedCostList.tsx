
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { SortControls } from "./fixed-costs/SortControls";
import { CategoryCard } from "./fixed-costs/CategoryCard";
import { TotalCard } from "./fixed-costs/TotalCard";
import { LoadingState } from "./fixed-costs/LoadingState";
import { EmptyState } from "./fixed-costs/EmptyState";

interface FixedCost {
  id: string;
  name: string;
  description?: string;
  amount: number;
  category?: string;
}

interface FixedCostListProps {
  costs: FixedCost[];
  loading: boolean;
  onEdit: (cost: FixedCost) => void;
  onDelete: () => void;
}

export function FixedCostList({
  costs,
  loading,
  onEdit,
  onDelete
}: FixedCostListProps) {
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categorySortOrders, setCategorySortOrders] = useState<Record<string, 'asc' | 'desc'>>({});

  const handleDelete = async (costId: string) => {
    try {
      const { error } = await supabase.from('company_costs').delete().eq('id', costId);
      if (error) throw error;
      toast({
        title: "Custo removido",
        description: "O custo foi removido com sucesso."
      });
      onDelete();
    } catch (error: any) {
      console.error('Erro ao remover custo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o custo.",
        variant: "destructive"
      });
    }
  };

  const sortedCosts = [...costs].sort((a, b) => {
    return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
  });

  const costsByCategory = sortedCosts.reduce((acc: Record<string, FixedCost[]>, cost) => {
    const category = cost.category || 'Sem Categoria';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(cost);
    return acc;
  }, {});

  const handleCategorySortToggle = (category: string) => {
    setCategorySortOrders(prev => ({
      ...prev,
      [category]: prev[category] === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortedCostsForCategory = (categoryCosts: FixedCost[], category: string) => {
    const categorySort = categorySortOrders[category] || 'desc';
    return [...categoryCosts].sort((a, b) => {
      return categorySort === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    });
  };

  const totalAmount = costs.reduce((sum, cost) => sum + cost.amount, 0);

  if (loading) {
    return <LoadingState />;
  }

  if (costs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <SortControls 
        sortOrder={sortOrder} 
        onSortChange={setSortOrder} 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(costsByCategory).map(([category, categoryCosts]) => {
          const sortedCategoryCosts = getSortedCostsForCategory(categoryCosts as FixedCost[], category);
          const categorySort = categorySortOrders[category] || 'desc';
          
          return (
            <CategoryCard
              key={category}
              category={category}
              costs={sortedCategoryCosts as FixedCost[]}
              categorySort={categorySort}
              onEdit={onEdit}
              onDelete={handleDelete}
              onSortToggle={handleCategorySortToggle}
            />
          );
        })}
      </div>

      <TotalCard 
        totalAmount={totalAmount} 
        costsCount={costs.length} 
      />
    </div>
  );
}
