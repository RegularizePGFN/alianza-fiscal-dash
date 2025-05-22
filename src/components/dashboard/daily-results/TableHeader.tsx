
import { useDailyResults } from "./DailyResultsContext";
import { SortColumn } from "./types";

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

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <thead>
      <tr className="bg-muted/50">
        <th 
          onClick={() => handleSort('name')} 
          className="py-1.5 px-2 font-medium text-xs border-b border-r border-border/30 cursor-pointer"
        >
          Nome {getSortIndicator('name')}
        </th>
        <th 
          onClick={() => handleSort('salesCount')} 
          className="py-1.5 px-2 font-medium text-xs border-b border-r border-border/30 cursor-pointer text-center"
        >
          Vendas {getSortIndicator('salesCount')}
        </th>
        <th 
          onClick={() => handleSort('salesAmount')} 
          className="py-1.5 px-2 font-medium text-xs border-b border-r border-border/30 cursor-pointer text-center"
        >
          Valor {getSortIndicator('salesAmount')}
        </th>
        <th 
          onClick={() => handleSort('proposals')} 
          className="py-1.5 px-2 font-medium text-xs border-b border-r border-border/30 cursor-pointer text-center"
        >
          Propostas {getSortIndicator('proposals')}
        </th>
        <th 
          onClick={() => handleSort('fees')} 
          className="py-1.5 px-2 font-medium text-xs border-b border-border/30 cursor-pointer text-center"
        >
          Honorários {getSortIndicator('fees')}
        </th>
      </tr>
    </thead>
  );
}
