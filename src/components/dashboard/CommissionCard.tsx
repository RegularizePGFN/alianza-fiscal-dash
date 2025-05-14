
import { formatCurrency, formatPercentage, calculateCommission } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';
import { Progress } from '@/components/ui/progress';

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
  
  // Para vendedores, mantém o comportamento original
  const { rate: commissionRate, amount: commissionAmount } = calculateCommission(totalSales, goalAmount);
  const isGoalMet = totalSales >= goalAmount;
  const progressPercentage = Math.min(100, Math.round((totalSales / goalAmount) * 100));
  
  return (
    <Card className="h-full relative overflow-hidden group transition-all duration-300 hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Comissão Projetada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 relative">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold">{formatCurrency(commissionAmount)}</span>
          <span className={`text-lg font-semibold ${isGoalMet ? 'text-af-green-500' : 'text-primary'}`}>
            {formatPercentage(commissionRate)}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Progresso</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="text-sm text-muted-foreground">
          {isGoalMet ? (
            <p>
              Parabéns! Você atingiu sua meta e está recebendo a taxa de comissão mais alta de {formatPercentage(commissionRate)}.
            </p>
          ) : (
            <p>
              Taxa atual: {formatPercentage(commissionRate)}. 
              Atinja R$ {goalAmount.toLocaleString('pt-BR')} em vendas para aumentar para 25%.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
