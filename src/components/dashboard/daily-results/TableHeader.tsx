
import { useDailyResults } from "./DailyResultsContext";
import { SortColumn } from "./types";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function TableHeader() {
  const { sortColumn, sortDirection, setSortColumn, setSortDirection } = useDailyResults();

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 inline ml-0.5" />
      : <ArrowDown className="h-3 w-3 inline ml-0.5" />;
  };

  const headerClass = "py-2 px-3 font-medium text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap";

  return (
    <thead className="sticky top-0 z-10 bg-muted/50">
      <tr>
        <th 
          onClick={() => handleSort('name')} 
          className={cn(headerClass, "text-left rounded-tl-lg")}
        >
          Vendedor <SortIcon column="name" />
        </th>
        <th 
          onClick={() => handleSort('salesCount')} 
          className={cn(headerClass, "text-center")}
        >
          Vendas <SortIcon column="salesCount" />
        </th>
        <th 
          onClick={() => handleSort('salesAmount')} 
          className={cn(headerClass, "text-right")}
        >
          Valor <SortIcon column="salesAmount" />
        </th>
        <th 
          onClick={() => handleSort('proposals')} 
          className={cn(headerClass, "text-center")}
        >
          Propostas <SortIcon column="proposals" />
        </th>
        <th 
          onClick={() => handleSort('fees')} 
          className={cn(headerClass, "text-right rounded-tr-lg")}
        >
          Honorários <SortIcon column="fees" />
        </th>
      </tr>
    </thead>
  );
}
