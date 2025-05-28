
import React from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Info, FileText } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export function ReportsHeader() {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <BarChart3 className="h-6 w-6" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Relatórios
          </h2>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <p>Análise consolidada de vendas e visualizações gráficas dos dados.</p>
        </div>
      </div>

      <motion.div 
        className="flex items-center gap-2 self-end sm:self-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                  onClick={() => window.print()}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Exportar relatórios</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Informações</span>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Estes relatórios são atualizados em tempo real.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </motion.div>
  );
}
