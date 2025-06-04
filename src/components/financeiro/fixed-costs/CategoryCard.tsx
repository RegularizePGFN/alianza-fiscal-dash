
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown } from "lucide-react";
import { CostItem } from "./CostItem";

interface FixedCost {
  id: string;
  name: string;
  description?: string;
  amount: number;
  category?: string;
}

interface CategoryCardProps {
  category: string;
  costs: FixedCost[];
  categorySort: 'asc' | 'desc';
  onEdit: (cost: FixedCost) => void;
  onDelete: (costId: string) => void;
  onSortToggle: (category: string) => void;
}

export function CategoryCard({ 
  category, 
  costs, 
  categorySort, 
  onEdit, 
  onDelete, 
  onSortToggle 
}: CategoryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const categoryTotal = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const categoryHeaderColor = 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700';

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className={`pb-2 ${categoryHeaderColor}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {category}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {costs.length} {costs.length === 1 ? 'item' : 'itens'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/30 rounded-lg p-2 mt-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Total da categoria:
          </span>
          <button 
            onClick={() => onSortToggle(category)} 
            className="flex items-center gap-1 text-base font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            {formatCurrency(categoryTotal)}
            {categorySort === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-3">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {costs.map((cost) => (
            <CostItem 
              key={cost.id} 
              cost={cost} 
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
