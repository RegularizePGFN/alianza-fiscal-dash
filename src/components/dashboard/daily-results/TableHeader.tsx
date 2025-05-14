
import { ArrowDown, ArrowUp } from "lucide-react";
import { SortColumn } from "./types";
import { useDailyResults } from "./DailyResultsContext";

export function TableHeader() {
  const { sortColumn, sortDirection, handleSort } = useDailyResults();
  
  // Sort indicator component
  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 inline ml-1" /> 
      : <ArrowDown className="h-3 w-3 inline ml-1" />;
  };
  
  return (
    <thead className="sticky top-0 bg-white z-10">
      <tr className="border-b">
        <th className="text-left py-1 font-medium text-muted-foreground">
          Vendedor
        </th>
        <th 
          className="text-center py-1 font-medium text-muted-foreground cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleSort('salesCount')}
        >
          Vendas <SortIndicator column="salesCount" />
        </th>
        <th 
          className="text-right py-1 font-medium text-muted-foreground cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => handleSort('salesAmount')}
        >
          Total <SortIndicator column="salesAmount" />
        </th>
      </tr>
    </thead>
  );
}
