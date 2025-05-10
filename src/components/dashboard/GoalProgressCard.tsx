
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';
import { useMemo } from 'react';

interface GoalProgressCardProps {
  currentValue: number;
  goalValue: number;
}

function getBusinessDaysInMonth(year: number, month: number): number {
  const lastDay = new Date(year, month + 1, 0).getDate();
  let businessDays = 0;
  
  for (let day = 1; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }
  
  return businessDays;
}

function getRemainingBusinessDays(): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentDay = today.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();
  let remainingBusinessDays = 0;
  
  for (let day = currentDay; day <= lastDay; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remainingBusinessDays++;
    }
  }
  
  return remainingBusinessDays;
}

export function GoalProgressCard({ currentValue, goalValue }: GoalProgressCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  const percentage = Math.min((currentValue / goalValue) * 100, 200);
  const isGoalMet = currentValue >= goalValue;
  
  const remainingAmount = Math.max(goalValue - currentValue, 0);
  const remainingBusinessDays = getRemainingBusinessDays();
  
  const dailyTarget = useMemo(() => {
    if (isGoalMet || remainingBusinessDays === 0) return 0;
    return remainingAmount / remainingBusinessDays;
  }, [isGoalMet, remainingAmount, remainingBusinessDays]);

  // Calculate total business days in month for stats
  const today = new Date();
  const totalBusinessDays = getBusinessDaysInMonth(today.getFullYear(), today.getMonth());
  
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-md">
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
              Faltam {formatCurrency(remainingAmount)}
            </span>
          )}
        </div>

        {/* Daily target information */}
        {!isGoalMet && remainingBusinessDays > 0 && (
          <div className="mt-4 p-4 border rounded-md bg-muted/30 space-y-2 animate-fade-in">
            <h4 className="text-sm font-medium">Meta diária para atingir o objetivo</h4>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xl font-semibold">{formatCurrency(dailyTarget)}</span>
                <span className="text-sm text-muted-foreground ml-2">por dia útil</span>
              </div>
              <span className="text-sm text-muted-foreground">{remainingBusinessDays} dias úteis restantes</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Apenas dias úteis (seg-sex) são considerados no cálculo
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
