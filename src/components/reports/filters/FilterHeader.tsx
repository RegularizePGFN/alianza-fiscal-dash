
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FilterHeaderProps {
  showFilters: boolean;
  onToggleFilters: () => void;
}

export function FilterHeader({ showFilters, onToggleFilters }: FilterHeaderProps) {
  return (
    <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 rounded-t-lg">
      <CardTitle className="text-lg">Filtros</CardTitle>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8"
        onClick={onToggleFilters}
      >
        {showFilters ? 'Ocultar' : 'Mostrar'}
      </Button>
    </CardHeader>
  );
}
