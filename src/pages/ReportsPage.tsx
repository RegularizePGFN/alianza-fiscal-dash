
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CompactReportsFilter } from "@/components/reports/CompactReportsFilter";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { PaymentMethodSummaryCards } from "@/components/reports/PaymentMethodSummaryCards";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { ReportsMetricsCards } from "@/components/reports/ReportsMetricsCards";
import { SalesVolumeChart } from "@/components/reports/SalesVolumeChart";
import { TopSalesmenCard } from "@/components/reports/TopSalesmenCard";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // State for month filter (default to current month)
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => new Date());
  
  // State for custom date filter (when user wants specific periods)
  const [customDateFilter, setCustomDateFilter] = useState<DateFilter | null>(null);
  
  // State for commission month filter
  const [selectedCommissionMonth, setSelectedCommissionMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

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

  const currentMonthLabel = format(selectedMonthDate, 'MMMM yyyy', { locale: ptBR });

  // Generate month options for commission filter
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 12; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = format(date, 'MMMM yyyy', { locale: ptBR });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();

  return (
    <AppLayout>
      <div className="h-full flex flex-col space-y-6 p-6">
        {/* Compact Filters */}
        <CompactReportsFilter 
          onSalespersonChange={setSelectedSalesperson}
          onPaymentMethodChange={setSelectedPaymentMethod}
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
        
        {/* Charts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Análise Gráfica
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Visualizações detalhadas dos dados de vendas
            </p>
          </div>
          <ReportsCharts 
            salesData={salesData} 
            loading={loading}
            error={error}
          />
        </div>

        {/* Salespeople Commissions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Consolidado Vendedores
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Resumo detalhado do desempenho dos vendedores por mês
                </p>
              </div>
            </div>
            
            <SalespeopleCommissionsCard selectedMonth={selectedCommissionMonth} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
