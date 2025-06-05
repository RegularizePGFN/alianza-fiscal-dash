
import { useState } from "react";
import { CompactReportsFilter } from "@/components/reports/CompactReportsFilter";
import { ReportsMetricsCards } from "@/components/reports/ReportsMetricsCards";
import { PaymentMethodSummaryCards } from "@/components/reports/PaymentMethodSummaryCards";
import { SalesVolumeChart } from "@/components/reports/SalesVolumeChart";
import { TopSalesmenCard } from "@/components/reports/TopSalesmenCard";
import { DateFilter, PaymentMethod } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportsContainerProps {
  onFiltersChange?: (filters: {
    salespersonId: string | null;
    paymentMethod: PaymentMethod | null;
    dateFilter: DateFilter | null;
  }) => void;
}

export function ReportsContainer({ onFiltersChange }: ReportsContainerProps) {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // State for month filter (default to current month)
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  
  // State for custom date filter (when user wants specific periods)
  const [customDateFilter, setCustomDateFilter] = useState<DateFilter | null>(null);

  // Generate the date filter based on selected month or custom filter
  const getActiveDateFilter = (): DateFilter | null => {
    if (customDateFilter) {
      return customDateFilter;
    }
    
    const startDate = startOfMonth(selectedMonthDate);
    const endDate = endOfMonth(selectedMonthDate);
    
    return {
      startDate,
      endDate
    };
  };

  const { salesData, loading, error } = useReportsData({
    salespersonId: selectedSalesperson,
    paymentMethod: selectedPaymentMethod,
    dateFilter: getActiveDateFilter()
  });

  const handlePreviousMonth = () => {
    setSelectedMonthDate(prev => subMonths(prev, 1));
    setCustomDateFilter(null);
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(prev => addMonths(prev, 1));
    setCustomDateFilter(null);
  };

  const handleCustomDateFilterChange = (dateFilter: DateFilter | null) => {
    setCustomDateFilter(dateFilter);
  };

  const handleSalespersonChange = (salespersonId: string | null) => {
    setSelectedSalesperson(salespersonId);
    if (onFiltersChange) {
      onFiltersChange({
        salespersonId,
        paymentMethod: selectedPaymentMethod,
        dateFilter: getActiveDateFilter()
      });
    }
  };

  const handlePaymentMethodChange = (paymentMethod: PaymentMethod | null) => {
    setSelectedPaymentMethod(paymentMethod);
    if (onFiltersChange) {
      onFiltersChange({
        salespersonId: selectedSalesperson,
        paymentMethod,
        dateFilter: getActiveDateFilter()
      });
    }
  };

  const currentMonthLabel = format(selectedMonthDate, 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Compact Filters */}
      <CompactReportsFilter 
        onSalespersonChange={handleSalespersonChange}
        onPaymentMethodChange={handlePaymentMethodChange}
        onDateFilterChange={handleCustomDateFilterChange}
        currentMonth={currentMonthLabel}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        hasCustomFilter={customDateFilter !== null}
      />

      {/* Metrics Overview Cards */}
      <ReportsMetricsCards salesData={salesData} />
      
      {/* Payment Method Summary Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Resumo por Método de Pagamento
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Total recebido por cada método de pagamento no período selecionado
          </p>
        </div>
        <PaymentMethodSummaryCards salesData={salesData} />
      </div>

      {/* Top Salesmen and Volume Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopSalesmenCard salesData={salesData} />
        </div>
        <div className="lg:col-span-2">
          <SalesVolumeChart salesData={salesData} />
        </div>
      </div>

      {/* Export sales data and loading/error states for use by parent */}
      <div className="hidden">
        {JSON.stringify({ salesData, loading, error })}
      </div>
    </div>
  );
}
