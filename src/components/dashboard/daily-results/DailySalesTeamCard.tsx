
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { Users, Calendar } from "lucide-react";
import { DailyResultsContent } from "./DailyResultsContent";
import { DailyResultsProvider } from "./DailyResultsContext";
import { motion } from "framer-motion";

interface DailySalesTeamCardProps {
  todaySales: Sale[];
  currentDate: string;
}

export function DailySalesTeamCard({ todaySales, currentDate }: DailySalesTeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="transition-all duration-300 hover:shadow-lg dark:border-gray-700 border-0 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <motion.div
              className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Users className="h-4 w-4" />
            </motion.div>
            <span className="text-gray-900 dark:text-white">Vendedores do Dia</span>
            <motion.span 
              className="text-xs ml-auto bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 dark:bg-gradient-to-r dark:from-purple-900/50 dark:to-purple-800/50 dark:text-purple-300 px-3 py-1 rounded-full font-medium flex items-center gap-1"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Calendar className="h-3 w-3" />
              {currentDate}
            </motion.span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
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
