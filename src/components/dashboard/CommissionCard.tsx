
import { formatCurrency, formatPercentage, calculateCommission } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';
import { COMMISSION_TRIGGER_GOAL } from '@/lib/constants';

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
  
  // Para vendedores, mantém o comportamento original mas usando o COMMISSION_TRIGGER_GOAL
  const { rate: commissionRate, amount: commissionAmount } = calculateCommission(totalSales, goalAmount);
  const isGoalMet = totalSales >= COMMISSION_TRIGGER_GOAL;
  
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
              Parabéns! Você atingiu a meta de comissão de {formatCurrency(COMMISSION_TRIGGER_GOAL)} e está recebendo a taxa mais alta de {formatPercentage(commissionRate)}.
            </p>
          ) : (
            <p>
              Taxa atual: {formatPercentage(commissionRate)}. 
              Atinja {formatCurrency(COMMISSION_TRIGGER_GOAL)} em vendas para aumentar para 25%.
            </p>
          )}
        </div>
        
        {goalAmount !== COMMISSION_TRIGGER_GOAL && (
          <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
            <p>
              <strong>Nota:</strong> A meta administrativa é de {formatCurrency(goalAmount)}, 
              mas a meta para aumento da taxa de comissão é fixa em {formatCurrency(COMMISSION_TRIGGER_GOAL)}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
