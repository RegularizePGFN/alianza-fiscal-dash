
import { ArrowDown, ArrowUp, User, DollarSign, ShoppingCart, FileText, Briefcase } from 'lucide-react';
import { useDailyResults } from './DailyResultsContext';
import { SortColumn } from './types';

export function TableHeader() {
  const { sortColumn, sortDirection, sortBy } = useDailyResults();

  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 inline ml-1" />
    );
  };
  
  return (
    <thead>
      <tr className="border-b border-gray-200 [&_th]:py-2 [&_th]:px-3 [&_th]:text-xs [&_th]:text-left [&_th]:font-medium [&_th]:text-gray-500">
        <th 
          className="cursor-pointer hover:text-gray-700"
          onClick={() => sortBy('name')}
        >
          <span className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            Nome
            {renderSortIcon('name')}
          </span>
        </th>
        <th 
          className="cursor-pointer hover:text-gray-700 text-right"
          onClick={() => sortBy('salesCount')}
        >
          <span className="flex items-center justify-end">
            <ShoppingCart className="h-3 w-3 mr-1" />
            Vendas
            {renderSortIcon('salesCount')}
          </span>
        </th>
        <th 
          className="cursor-pointer hover:text-gray-700 text-right"
          onClick={() => sortBy('salesAmount')}
        >
          <span className="flex items-center justify-end">
            <DollarSign className="h-3 w-3 mr-1" />
            Valor
            {renderSortIcon('salesAmount')}
          </span>
        </th>
        <th 
          className="cursor-pointer hover:text-gray-700 text-right"
          onClick={() => sortBy('proposalsCount')}
        >
          <span className="flex items-center justify-end">
            <FileText className="h-3 w-3 mr-1" />
            Prop. Enviada
            {renderSortIcon('proposalsCount')}
          </span>
        </th>
        <th 
          className="cursor-pointer hover:text-gray-700 text-right"
          onClick={() => sortBy('feesAmount')}
        >
          <span className="flex items-center justify-end">
            <Briefcase className="h-3 w-3 mr-1" />
            Honorários
            {renderSortIcon('feesAmount')}
          </span>
        </th>
      </tr>
    </thead>
  );
}
