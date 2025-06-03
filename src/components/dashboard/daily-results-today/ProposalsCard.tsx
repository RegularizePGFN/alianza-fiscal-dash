
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ProposalsCardProps {
  count: number;
  isAdmin: boolean;
}

export function ProposalsCard({ count, isAdmin }: ProposalsCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <div>
          <CardTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {isAdmin ? "Propostas da Equipe Hoje" : "Minhas Propostas Hoje"}
          </CardTitle>
          <div className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
            {count}
          </div>
        </div>
        <div className="rounded-md bg-blue-100 dark:bg-blue-800/50 p-1.5 text-blue-700 dark:text-blue-300">
          <FileText className="h-3 w-3" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          {isAdmin ? "Propostas criadas pela equipe hoje" : "Propostas que criei hoje"}
        </p>
      </CardContent>
    </Card>
  );
}
