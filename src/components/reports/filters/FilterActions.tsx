
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterActionsProps {
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export function FilterActions({ hasActiveFilters, activeFilterCount, onClearFilters }: FilterActionsProps) {
  return (
    <div className="flex justify-end mt-6">
      <Button 
        variant="outline" 
        onClick={onClearFilters}
        className={cn(
          "gap-2",
          hasActiveFilters 
            ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-600 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800 dark:text-red-400"
            : ""
        )}
        disabled={!hasActiveFilters}
      >
        <FilterX className="h-4 w-4" />
        Limpar Filtros
        {hasActiveFilters && (
          <span className="ml-1 w-5 h-5 bg-red-100 dark:bg-red-800 rounded-full grid place-items-center text-xs">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  );
}
