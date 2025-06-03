
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface FeesCardProps {
  totalFees: number;
  isAdmin: boolean;
}

export function FeesCard({ totalFees, isAdmin }: FeesCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
            {isAdmin ? "Simulações Realizadas Hoje" : "Minhas Simulações Hoje"}
          </CardTitle>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalFees)}
          </div>
        </div>
        <div className="rounded-md bg-green-100 dark:bg-green-800/50 p-2 text-green-700 dark:text-green-300">
          <FileText className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-green-600 dark:text-green-400">
          {isAdmin ? "Honorários das simulações da equipe" : "Honorários das minhas simulações"}
        </p>
      </CardContent>
    </Card>
  );
}
