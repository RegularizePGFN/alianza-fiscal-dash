
import { formatCurrency, formatPercentage, calculateCommission } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';

interface CommissionCardProps {
  totalSales: number;
  goalAmount: number;
}

export function CommissionCard({ totalSales, goalAmount }: CommissionCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const { rate: commissionRate, amount: commissionAmount } = calculateCommission(totalSales, goalAmount);
  const isGoalMet = totalSales >= goalAmount;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {isAdmin ? 'Comissão Projetada da Equipe' : 'Comissão Projetada'}
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
          {isAdmin ? (
            isGoalMet ? (
              <p>
                Parabéns! A equipe atingiu a meta e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
              </p>
            ) : (
              <p>
                Taxa atual: {formatPercentage(commissionRate)}. 
                A equipe precisa atingir R$ {goalAmount.toLocaleString('pt-BR')} em vendas para aumentar para 25%.
              </p>
            )
          ) : (
            isGoalMet ? (
              <p>
                Parabéns! Você atingiu sua meta e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
              </p>
            ) : (
              <p>
                Taxa atual: {formatPercentage(commissionRate)}. 
                Atinja R$ {goalAmount.toLocaleString('pt-BR')} em vendas para aumentar para 25%.
              </p>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
