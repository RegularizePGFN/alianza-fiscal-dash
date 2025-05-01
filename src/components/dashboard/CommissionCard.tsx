
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from '@/lib/constants';

interface CommissionCardProps {
  netAmount: number;
  totalSales: number;
  goalAmount: number;
}

export function CommissionCard({ netAmount, totalSales, goalAmount }: CommissionCardProps) {
  const isGoalMet = totalSales >= goalAmount;
  const commissionRate = isGoalMet ? COMMISSION_RATE_ABOVE_GOAL : COMMISSION_RATE_BELOW_GOAL;
  const commissionAmount = netAmount * commissionRate;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Comissão Projetada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">{formatCurrency(commissionAmount)}</span>
          <span className={`text-lg font-semibold ${isGoalMet ? 'text-af-green-500' : 'text-primary'}`}>
            {formatPercentage(commissionRate)}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {isGoalMet ? (
            <p>
              Parabéns! Você atingiu sua meta e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
            </p>
          ) : (
            <p>
              Taxa atual: {formatPercentage(commissionRate)}. 
              Atinja R$ {goalAmount.toLocaleString('pt-BR')} em vendas para aumentar para {formatPercentage(COMMISSION_RATE_ABOVE_GOAL)}.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
