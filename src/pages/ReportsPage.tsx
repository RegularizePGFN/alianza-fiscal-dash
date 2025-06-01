
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsFilter } from "@/components/reports/ReportsFilter";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { SalespeopleCommissionsCard } from "@/components/dashboard/salespeople-commissions";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);
  const [consolidatedMonth, setConsolidatedMonth] = useState<number>(new Date().getMonth() + 1);
  const [consolidatedYear, setConsolidatedYear] = useState<number>(new Date().getFullYear());

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  const { salesData, loading, error } = useReportsData({
    salespersonId: selectedSalesperson,
    paymentMethod: selectedPaymentMethod,
    dateFilter: dateFilter
  });

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

          {/* Consolidado de Vendedores com filtro por mês */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 print:break-inside-avoid print:mb-10 transition-colors duration-300">
            <div className="mb-4 flex gap-4 items-center">
              <h3 className="text-lg font-medium">Consolidado de Vendedores</h3>
              <div className="flex gap-2 items-center">
                <select 
                  value={consolidatedMonth}
                  onChange={(e) => setConsolidatedMonth(parseInt(e.target.value))}
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
                  onChange={(e) => setConsolidatedYear(parseInt(e.target.value))}
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
      </div>
    </AppLayout>
  );
}
