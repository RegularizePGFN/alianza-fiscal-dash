
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { DailyResultsContent } from "./DailyResultsContent";
import { DailyResultsProvider } from "./DailyResultsContext";

interface DailySalesTeamCardProps {
  todaySales: Sale[];
  currentDate: string;
}

export function DailySalesTeamCard({ todaySales, currentDate }: DailySalesTeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -2 }}
    >
      <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 dark:border-gray-700 border-border/40 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3 px-6 pt-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20"
              >
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <span>Vendedores do Dia</span>
              <motion.span 
                className="text-xs ml-auto bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 dark:from-purple-900/50 dark:to-purple-800/30 dark:text-purple-300 px-3 py-1 rounded-full border border-purple-200/50 dark:border-purple-700/50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
              >
                {currentDate}
              </motion.span>
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent className="px-6 pb-4 pt-0">
          <DailyResultsProvider>
            <DailyResultsContent 
              todaySales={todaySales}
              currentDate={currentDate}
            />
          </DailyResultsProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
}
