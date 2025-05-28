
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { getCurrentMonthDates } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

interface DashboardHeaderProps {
  isLoading: boolean;
}

export function DashboardHeader({
  isLoading
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const { start: monthStart } = getCurrentMonthDates();
  
  const monthLabel = monthStart.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <BarChart3 className="h-6 w-6 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Dashboard
        </h1>
      </motion.div>
      
      <motion.p 
        className="text-muted-foreground dark:text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Visão geral de vendas e comissões para {monthLabel}
      </motion.p>
    </motion.div>
  );
}
