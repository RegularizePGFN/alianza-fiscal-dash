
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/lib/types";
import { Users } from "lucide-react";
import { DailyResultsContent } from "./DailyResultsContent";
import { DailyResultsProvider } from "./DailyResultsContext";

interface DailySalesTeamCardProps {
  todaySales: Sale[];
  currentDate: string;
}

export function DailySalesTeamCard({ todaySales, currentDate }: DailySalesTeamCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>Vendedores do Dia</span>
          <span className="text-xs ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-0.5 rounded-full">
            {currentDate}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <DailyResultsProvider>
          <DailyResultsContent />
        </DailyResultsProvider>
      </CardContent>
    </Card>
  );
}
