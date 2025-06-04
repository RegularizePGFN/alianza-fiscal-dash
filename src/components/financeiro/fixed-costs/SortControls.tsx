
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface SortControlsProps {
  sortOrder: 'asc' | 'desc';
  onSortChange: (value: 'asc' | 'desc') => void;
}

export function SortControls({ sortOrder, onSortChange }: SortControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Custos por Categoria
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Ordenar por valor:</span>
        <Select value={sortOrder} onValueChange={onSortChange}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Maior para Menor
              </div>
            </SelectItem>
            <SelectItem value="asc">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Menor para Maior
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
