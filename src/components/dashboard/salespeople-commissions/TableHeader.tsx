
import { ArrowDown, ArrowUp } from "lucide-react";
import { SortColumn, SortDirection } from "./types";

interface TableHeaderProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  handleSort: (column: SortColumn) => void;
}

export function TableHeader({ sortColumn, sortDirection, handleSort }: TableHeaderProps) {
  // Render sort indicator
  const renderSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="inline-block ml-1 h-4 w-4" />
      : <ArrowDown className="inline-block ml-1 h-4 w-4" />;
  };
  
  return (
    <thead>
      <tr className="border-b border-gray-200">
        <th 
          className="text-center py-2 font-medium cursor-pointer hover:bg-gray-50" 
          onClick={() => handleSort('name')}
        >
          Vendedor {renderSortIndicator('name')}
        </th>
        <th 
          className="text-center py-2 font-medium cursor-pointer hover:bg-gray-50" 
          onClick={() => handleSort('salesCount')}
        >
          Total Vendas {renderSortIndicator('salesCount')}
        </th>
        <th 
          className="text-center py-2 font-medium cursor-pointer hover:bg-gray-50" 
          onClick={() => handleSort('zeroDaysCount')}
        >
          Dias sem vendas {renderSortIndicator('zeroDaysCount')}
        </th>
        <th 
          className="text-center py-2 font-medium cursor-pointer hover:bg-gray-50" 
          onClick={() => handleSort('totalSales')}
        >
          Total R$ {renderSortIndicator('totalSales')}
        </th>
        <th className="text-center py-2 font-medium">Meta</th>
        <th 
          className="text-center py-2 font-medium cursor-pointer hover:bg-gray-50" 
          onClick={() => handleSort('goalPercentage')}
        >
          % da Meta {renderSortIndicator('goalPercentage')}
        </th>
        <th 
          className="text-center py-2 font-medium cursor-pointer hover:bg-gray-50" 
          onClick={() => handleSort('metaGap')}
        >
          GAP Meta {renderSortIndicator('metaGap')}
        </th>
        <th 
          className="text-center py-2 font-medium cursor-pointer hover:bg-gray-50" 
          onClick={() => handleSort('remainingDailyTarget')}
        >
          Meta Diária Restante {renderSortIndicator('remainingDailyTarget')}
        </th>
        <th 
          className="text-center py-2 font-medium cursor-pointer hover:bg-gray-50" 
          onClick={() => handleSort('projectedCommission')}
        >
          Comissão Projetada {renderSortIndicator('projectedCommission')}
        </th>
      </tr>
    </thead>
  );
}
