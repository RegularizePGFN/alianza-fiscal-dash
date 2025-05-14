
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ReportsFilter } from "@/components/reports/ReportsFilter";
import { ReportsCharts } from "@/components/reports/ReportsCharts";
import { DateFilter, PaymentMethod, UserRole } from "@/lib/types";
import { useReportsData } from "@/hooks/useReportsData";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Card } from "@/components/ui/card";

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);

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
          <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
              Relatórios
            </h2>
            <p className="text-muted-foreground mt-1">
              Visualize e analise os dados de vendas da empresa
            </p>
          </div>
          
          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden print:hidden transition-colors duration-300 border-0">
            <div className="p-4 sm:p-6">
              <ReportsFilter 
                onSalespersonChange={setSelectedSalesperson}
                onPaymentMethodChange={setSelectedPaymentMethod}
                onDateFilterChange={setDateFilter}
              />
            </div>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 print:break-inside-avoid print:mb-10 transition-colors duration-300 border-0">
            <ReportsCharts 
              salesData={salesData} 
              loading={loading}
              error={error}
            />
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
