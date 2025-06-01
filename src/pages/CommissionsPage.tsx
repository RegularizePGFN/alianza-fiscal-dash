
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CommissionsFilter } from "@/components/commissions/CommissionsFilter";
import { CommissionsDashboard } from "@/components/commissions/CommissionsDashboard";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { UserRole } from "@/lib/types";

export default function CommissionsPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Redirect if not admin
  if (user?.role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
            <p className="text-muted-foreground">
              Histórico e consolidado de comissões dos vendedores
            </p>
          </div>
        </div>

        <CommissionsFilter 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        <CommissionsDashboard 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </AppLayout>
  );
}
