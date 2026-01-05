
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { DailyResultsContent } from "./DailyResultsContent";
import { DailyResultsProvider } from "./DailyResultsContext";

interface DailySalesTeamCardProps {
  currentDate: string;
}

export function DailySalesTeamCard({ currentDate }: DailySalesTeamCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-0 shadow-sm hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[hsl(var(--kpi-purple)/0.1)]">
                <Users className="h-4 w-4 text-[hsl(var(--kpi-purple))]" />
              </div>
              <CardTitle className="text-sm font-medium">
                Vendedores do Dia
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <Calendar className="h-3 w-3" />
              {currentDate}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <DailyResultsProvider>
            <DailyResultsContent />
          </DailyResultsProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
}
