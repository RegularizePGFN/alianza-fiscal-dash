
import { useDailyResults } from "./DailyResultsContext";

export function TableHeader() {
  const {
    sortColumn,
    sortDirection,
    setSortColumn,
    setSortDirection
  } = useDailyResults();
  
  const handleSort = (column: 'name' | 'proposals' | 'fees' | 'salesCount' | 'salesAmount') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc'); // Default to descending when changing columns
    }
  };
  
  return <thead>
      <tr className="border-b border-gray-200 dark:border-gray-700 text-xs">
        <th className="text-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('name')}>
          <span className="flex items-center justify-center">
            Nome
            {sortColumn === 'name' && <span className="ml-1">
                {sortDirection === 'asc' ? '▲' : '▼'}
              </span>}
          </span>
        </th>
        <th className="text-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('proposals')}>
          <span className="flex items-center justify-center">
            Prop. Enviada
            {sortColumn === 'proposals' && <span className="ml-1">
                {sortDirection === 'asc' ? '▲' : '▼'}
              </span>}
          </span>
        </th>
        <th className="text-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('fees')}>
          <span className="flex items-center justify-center">
            Honorários
            {sortColumn === 'fees' && <span className="ml-1">
                {sortDirection === 'asc' ? '▲' : '▼'}
              </span>}
          </span>
        </th>
        <th className="text-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('salesCount')}>
          <span className="flex items-center justify-center">
            Vendas
            {sortColumn === 'salesCount' && <span className="ml-1">
                {sortDirection === 'asc' ? '▲' : '▼'}
              </span>}
          </span>
        </th>
        <th className="text-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('salesAmount')}>
          <span className="flex items-center justify-center">
            Valor
            {sortColumn === 'salesAmount' && <span className="ml-1">
                {sortDirection === 'asc' ? '▲' : '▼'}
              </span>}
          </span>
        </th>
      </tr>
    </thead>;
}
