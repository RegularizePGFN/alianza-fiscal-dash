
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface FixedCost {
  id: string;
  name: string;
  description?: string;
  amount: number;
  category?: string;
}

interface CostItemProps {
  cost: FixedCost;
  onEdit: (cost: FixedCost) => void;
  onDelete: (costId: string) => void;
}

export function CostItem({ cost, onEdit, onDelete }: CostItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-200">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{cost.name}</h4>
          <Badge variant="secondary" className="text-xs">Fixo</Badge>
        </div>
        {cost.description && <p className="text-xs text-muted-foreground line-clamp-1">{cost.description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatCurrency(cost.amount)}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onEdit(cost)} className="h-8 w-8 p-0">
          <Edit className="h-3 w-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o custo "{cost.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(cost.id)}>
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
