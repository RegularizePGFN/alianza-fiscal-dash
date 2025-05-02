
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';

interface GoalProgressCardProps {
  currentValue: number;
  goalValue: number;
}

export function GoalProgressCard({ currentValue, goalValue }: GoalProgressCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const percentage = Math.min((currentValue / goalValue) * 100, 200);
  const isGoalMet = currentValue >= goalValue;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {isAdmin ? 'Meta Mensal da Equipe' : 'Meta Mensal'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-2xl font-bold">{formatCurrency(currentValue)}</span>
          <span className="text-muted-foreground">/ {formatCurrency(goalValue)}</span>
        </div>
        
        <div className="goal-meter">
          <div 
            className={cn(
              "goal-meter-fill",
              isGoalMet ? "goal" : "under"
            )}
            style={{ '--progress-value': `${percentage}%` } as React.CSSProperties}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span 
            className={cn(
              "font-medium",
              isGoalMet ? "text-af-green-500" : "text-muted-foreground"
            )}
          >
            {formatPercentage(currentValue / goalValue)}
          </span>
          
          {isGoalMet ? (
            <span className="text-af-green-500 font-medium">
              {isAdmin ? 'Meta da equipe atingida! 🎉' : 'Meta atingida! 🎉'}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Faltam {formatCurrency(goalValue - currentValue)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
