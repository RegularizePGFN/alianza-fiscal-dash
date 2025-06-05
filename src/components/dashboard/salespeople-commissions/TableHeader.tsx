
import { TableHead, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TableHeaderProps {
  onSort: (field: 'name' | 'sales' | 'commission' | 'value') => void;
  sortBy: 'name' | 'sales' | 'commission' | 'value';
  sortOrder: 'asc' | 'desc';
}

export function TableHeader({ onSort, sortBy, sortOrder }: TableHeaderProps) {
  const getSortIcon = (field: 'name' | 'sales' | 'commission' | 'value') => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <TableRow>
      <TableHead 
        className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
        onClick={() => onSort('name')}
      >
        <div className="flex items-center gap-1">
          Vendedor
          {getSortIcon('name')}
        </div>
      </TableHead>
      <TableHead 
        className="text-center cursor-pointer hover:bg-muted/50 transition-colors select-none"
        onClick={() => onSort('sales')}
      >
        <div className="flex items-center justify-center gap-1">
          Vendas
          {getSortIcon('sales')}
        </div>
      </TableHead>
      <TableHead 
        className="text-center cursor-pointer hover:bg-muted/50 transition-colors select-none"
        onClick={() => onSort('value')}
      >
        <div className="flex items-center justify-center gap-1">
          Valor Total
          {getSortIcon('value')}
        </div>
      </TableHead>
      <TableHead 
        className="text-center cursor-pointer hover:bg-muted/50 transition-colors select-none"
        onClick={() => onSort('commission')}
      >
        <div className="flex items-center justify-center gap-1">
          Comissão
          {getSortIcon('commission')}
        </div>
      </TableHead>
    </TableRow>
  );
}
