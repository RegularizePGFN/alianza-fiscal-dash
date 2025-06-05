
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsFilter } from "@/components/reports/ReportsFilter";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { PaymentMethodSummaryCards } from "@/components/reports/PaymentMethodSummaryCards";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  // State for month filter (default to current month)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });
  
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
    
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));
      
      return {
        startDate,
        endDate
      };
    }
    
    return null;
  };

  const { salesData, loading, error } = useReportsData({
    salespersonId: selectedSalesperson,
    paymentMethod: selectedPaymentMethod,
    dateFilter: getActiveDateFilter()
  });

  // Generate month options for filters
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

  const handleCustomDateFilterChange = (dateFilter: DateFilter | null) => {
    setCustomDateFilter(dateFilter);
    // Reset month selection when custom filter is applied
    if (dateFilter) {
      setSelectedMonth('');
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    // Clear custom date filter when month is selected
    setCustomDateFilter(null);
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col space-y-4 p-4">
        {/* Header with Month Selector */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Relatórios
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Análise detalhada de vendas e performance
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mês:</span>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
          <div className="p-4">
            <ReportsFilter 
              onSalespersonChange={setSelectedSalesperson}
              onPaymentMethodChange={setSelectedPaymentMethod}
              onDateFilterChange={handleCustomDateFilterChange}
            />
          </div>
        </div>
        
        {/* Payment Method Summary Cards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-300">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Resumo por Método de Pagamento
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Total recebido por cada método de pagamento no período selecionado
            </p>
          </div>
          <PaymentMethodSummaryCards salesData={salesData} />
        </div>
        
        {/* Charts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 transition-colors duration-300 flex-1">
          <ReportsCharts 
            salesData={salesData} 
            loading={loading}
            error={error}
          />
        </div>

        {/* Salespeople Commissions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-colors duration-300">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Consolidado Vendedores
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Resumo detalhado do desempenho dos vendedores por mês
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mês das Comissões:</span>
                <Select value={selectedCommissionMonth} onValueChange={setSelectedCommissionMonth}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <SalespeopleCommissionsCard selectedMonth={selectedCommissionMonth} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
