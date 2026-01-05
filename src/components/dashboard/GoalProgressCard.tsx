
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/lib/types';
import { useMemo } from 'react';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCountUpCurrency } from '@/hooks/useCountUp';

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
  
  const percentage = Math.min((currentValue / goalValue) * 100, 100);
  const isGoalMet = currentValue >= goalValue;
  
  const remainingAmount = Math.max(goalValue - currentValue, 0);
  const remainingBusinessDays = getRemainingBusinessDays();
  
  const dailyTarget = useMemo(() => {
    if (isGoalMet || remainingBusinessDays === 0) return 0;
    return remainingAmount / remainingBusinessDays;
  }, [isGoalMet, remainingAmount, remainingBusinessDays]);

  const today = new Date();
  const totalBusinessDays = getBusinessDaysInMonth(today.getFullYear(), today.getMonth());
  
  const animatedCurrent = useCountUpCurrency(currentValue);
  const animatedGoal = useCountUpCurrency(goalValue);
  const animatedDailyTarget = useCountUpCurrency(dailyTarget);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-0 shadow-sm hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isAdmin ? 'Meta Mensal da Equipe' : 'Meta Mensal'}
              </CardTitle>
            </div>
            {isGoalMet && (
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                ✓ Atingida
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Main Values */}
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight">{animatedCurrent}</span>
            <span className="text-sm text-muted-foreground">de {animatedGoal}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  isGoalMet ? "bg-success" : "bg-primary"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className={cn(
                "text-xs font-medium",
                isGoalMet ? "text-success" : "text-primary"
              )}>
                {percentage.toFixed(1)}%
              </span>
              {!isGoalMet && (
                <span className="text-xs text-muted-foreground">
                  Faltam {formatCurrency(remainingAmount)}
                </span>
              )}
            </div>
          </div>

          {/* Daily Target */}
          {!isGoalMet && remainingBusinessDays > 0 && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium">{animatedDailyTarget}</span>
                    <span className="text-xs text-muted-foreground">por dia útil</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {remainingBusinessDays} dias úteis restantes
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
