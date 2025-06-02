
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsFilter } from "@/components/reports/ReportsFilter";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  
  // State for commission month filter
  const [selectedCommissionMonth, setSelectedCommissionMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  const { salesData, loading, error } = useReportsData({
    salespersonId: selectedSalesperson,
    paymentMethod: selectedPaymentMethod,
    dateFilter: dateFilter
  });

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
      <div className="max-w-7xl mx-auto print:m-4">
        <div className="space-y-6 p-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden print:hidden transition-colors duration-300">
            <div className="border-t border-gray-100 dark:border-gray-700 p-4 sm:p-6">
              <ReportsFilter 
                onSalespersonChange={setSelectedSalesperson}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onDateFilterChange={setDateFilter}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 print:break-inside-avoid print:mb-10 transition-colors duration-300">
            <ReportsCharts 
              salesData={salesData} 
              loading={loading}
              error={error}
            />
          </div>

          {/* Consolidated Salespeople Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-300">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Consolidado Vendedores
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Resumo detalhado do desempenho dos vendedores por mês
                  </p>
                </div>
                
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
              
              <SalespeopleCommissionsCard selectedMonth={selectedCommissionMonth} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
