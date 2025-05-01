
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SalesSummaryCardProps {
  title: string;
  amount: number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function SalesSummaryCard({
  title,
  amount,
  description,
  icon,
  className,
  trend
}: SalesSummaryCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-2xl font-bold">
            {formatCurrency(amount)}
          </CardDescription>
        </div>
        {icon && (
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className={cn(
            "mt-2 text-xs font-medium",
            trend.isPositive ? "text-af-green-500" : "text-destructive"
          )}>
            <span>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              {' '}vs. mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
