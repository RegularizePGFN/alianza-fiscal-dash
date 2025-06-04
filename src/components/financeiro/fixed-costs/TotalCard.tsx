
import { Card, CardContent } from "@/components/ui/card";
import { Building } from "lucide-react";

interface TotalCardProps {
  totalAmount: number;
  costsCount: number;
}

export function TotalCard({ totalAmount, costsCount }: TotalCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
              <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Total dos Custos Fixos
              </h4>
              <p className="text-sm text-green-600 dark:text-green-300">
                {costsCount} {costsCount === 1 ? 'custo cadastrado' : 'custos cadastrados'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(totalAmount)}
            </span>
            <p className="text-sm text-green-600 dark:text-green-400">por mês</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
