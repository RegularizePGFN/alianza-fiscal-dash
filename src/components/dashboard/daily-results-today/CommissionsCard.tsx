
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface CommissionsCardProps {
  totalCommissions: number;
  isAdmin: boolean;
}

export function CommissionsCard({ totalCommissions, isAdmin }: CommissionsCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            {isAdmin ? "Comissões da Equipe Hoje" : "Minhas Comissões Hoje"}
          </CardTitle>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(totalCommissions)}
          </div>
        </div>
        <div className="rounded-md bg-purple-100 dark:bg-purple-800/50 p-2 text-purple-700 dark:text-purple-300">
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-purple-600 dark:text-purple-400">
          {isAdmin ? "Comissões das vendas da equipe hoje" : "Comissões das minhas vendas hoje"}
        </p>
      </CardContent>
    </Card>
  );
}
