
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { getCurrentMonthDates } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

interface DashboardHeaderProps {
  isLoading: boolean;
}

export function DashboardHeader({ isLoading }: DashboardHeaderProps) {
  const { user } = useAuth();
  const { start: monthStart } = getCurrentMonthDates();
  
  const monthLabel = monthStart.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <motion.div 
      className="flex items-center justify-between"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Dashboard
          </h1>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Visão geral de vendas e comissões • {monthLabel}
        </p>
      </div>
    </motion.div>
  );
}
