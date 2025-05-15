
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';
import { COMMISSION_GOAL_AMOUNT, COMMISSION_RATE_ABOVE_GOAL, COMMISSION_RATE_BELOW_GOAL } from '@/lib/constants';

interface CommissionCardProps {
  totalSales: number;
  goalAmount: number;
}

export function CommissionCard({ totalSales, goalAmount }: CommissionCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Se for admin, não calculamos a comissão
  if (isAdmin) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Comissão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              As informações de comissão são disponíveis apenas para os vendedores individuais.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // IMPORTANTE: Para vendedores, usamos o COMMISSION_GOAL_AMOUNT fixo e não a meta pessoal
  const commissionRate = totalSales >= COMMISSION_GOAL_AMOUNT ? COMMISSION_RATE_ABOVE_GOAL : COMMISSION_RATE_BELOW_GOAL;
  const commissionAmount = totalSales * commissionRate;
  const isCommissionGoalMet = totalSales >= COMMISSION_GOAL_AMOUNT;
  
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
          <span className={`text-lg font-semibold ${isCommissionGoalMet ? 'text-af-green-500' : 'text-primary'}`}>
            {formatPercentage(commissionRate)}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {isCommissionGoalMet ? (
            <p>
              Parabéns! Você atingiu a meta de comissão e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
            </p>
          ) : (
            <p>
              Taxa atual: {formatPercentage(commissionRate)}. 
              Atinja R$ {COMMISSION_GOAL_AMOUNT.toLocaleString('pt-BR')} em vendas para aumentar para 25%.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
