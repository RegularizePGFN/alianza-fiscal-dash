
import { ReportsFilter } from "../ReportsFilter";
import { ReportsCharts } from "../ReportsCharts";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { DateFilter, PaymentMethod } from "@/lib/types";
import { Sale } from "@/lib/types";

interface SalesReportsTabProps {
  selectedSalesperson: string | null;
  selectedPaymentMethod: PaymentMethod | null;
  dateFilter: DateFilter | null;
  consolidatedMonth: number;
  consolidatedYear: number;
  salesData: Sale[];
  loading: boolean;
  error: Error | null;
  onSalespersonChange: (value: string | null) => void;
  onPaymentMethodChange: (value: PaymentMethod | null) => void;
  onDateFilterChange: (value: DateFilter | null) => void;
  onConsolidatedMonthChange: (month: number) => void;
  onConsolidatedYearChange: (year: number) => void;
}

export function SalesReportsTab({
  selectedSalesperson,
  selectedPaymentMethod,
  dateFilter,
  consolidatedMonth,
  consolidatedYear,
  salesData,
  loading,
  error,
  onSalespersonChange,
  onPaymentMethodChange,
  onDateFilterChange,
  onConsolidatedMonthChange,
  onConsolidatedYearChange,
}: SalesReportsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filtros de vendas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden print:hidden transition-colors duration-300">
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 sm:p-6">
          <ReportsFilter 
            onSalespersonChange={onSalespersonChange}
            onPaymentMethodChange={onPaymentMethodChange}
            onDateFilterChange={onDateFilterChange}
          />
        </div>
      </div>
      
      {/* Gráficos de vendas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 print:break-inside-avoid print:mb-10 transition-colors duration-300">
        <ReportsCharts 
          salesData={salesData} 
          loading={loading}
          error={error}
        />
      </div>

      {/* Consolidado de Vendedores com filtro por mês */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 print:break-inside-avoid print:mb-10 transition-colors duration-300">
        <div className="mb-4 flex gap-4 items-center">
          <h3 className="text-lg font-medium">Consolidado de Vendedores</h3>
          <div className="flex gap-2 items-center">
            <select 
              value={consolidatedMonth}
              onChange={(e) => onConsolidatedMonthChange(parseInt(e.target.value))}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value={1}>Janeiro</option>
              <option value={2}>Fevereiro</option>
              <option value={3}>Março</option>
              <option value={4}>Abril</option>
              <option value={5}>Maio</option>
              <option value={6}>Junho</option>
              <option value={7}>Julho</option>
              <option value={8}>Agosto</option>
              <option value={9}>Setembro</option>
              <option value={10}>Outubro</option>
              <option value={11}>Novembro</option>
              <option value={12}>Dezembro</option>
            </select>
            <select 
              value={consolidatedYear}
              onChange={(e) => onConsolidatedYearChange(parseInt(e.target.value))}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
        </div>
        <SalespeopleCommissionsCard 
          selectedMonth={consolidatedMonth}
          selectedYear={consolidatedYear}
        />
      </div>
    </div>
  );
}
