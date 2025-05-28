
import { getCurrentMonthDates } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <TrendingUp className="h-6 w-6" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-300 mt-1">
            <Calendar className="h-4 w-4" />
            <p>Visão geral de vendas e comissões para {monthLabel}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
