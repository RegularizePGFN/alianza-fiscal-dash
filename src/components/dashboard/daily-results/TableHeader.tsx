
import { useDailyResults } from "./DailyResultsContext";
import { SortColumn } from "./types";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

export function TableHeader() {
  const { sortColumn, sortDirection, sortBy } = useDailyResults();

  const SortArrow = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ArrowUpAZ className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDownAZ className="h-3 w-3 ml-1" />
    );
  };

  const handleSort = (column: SortColumn) => () => {
    sortBy(column);
  };

  return (
    <thead>
      <tr className="text-xs font-medium text-muted-foreground border-b dark:border-gray-700">
        <th className="text-left py-2 pl-4 font-medium">
          <button
            className="flex items-center focus:outline-none"
            onClick={handleSort("name")}
          >
            Vendedor
            <SortArrow column="name" />
          </button>
        </th>
        <th className="text-center py-2 font-medium">
          <button
            className="flex items-center justify-center focus:outline-none mx-auto"
            onClick={handleSort("proposalsCount")}
          >
            Prop. Enviadas
            <SortArrow column="proposalsCount" />
          </button>
        </th>
        <th className="text-center py-2 font-medium">
          <button
            className="flex items-center justify-center focus:outline-none mx-auto"
            onClick={handleSort("feesAmount")}
          >
            Honorários
            <SortArrow column="feesAmount" />
          </button>
        </th>
        <th className="text-center py-2 font-medium">
          <button
            className="flex items-center justify-center focus:outline-none mx-auto"
            onClick={handleSort("salesCount")}
          >
            Vendas
            <SortArrow column="salesCount" />
          </button>
        </th>
        <th className="text-right py-2 pr-4 font-medium">
          <button
            className="flex items-center justify-end focus:outline-none ml-auto"
            onClick={handleSort("salesAmount")}
          >
            Valor
            <SortArrow column="salesAmount" />
          </button>
        </th>
      </tr>
    </thead>
  );
}

export default TableHeader;
