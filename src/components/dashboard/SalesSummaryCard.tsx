
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SalesSummaryCardProps {
  title: string;
  amount?: number;
  hideAmount?: boolean;
  numericValue?: number;
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
  hideAmount = false,
  numericValue,
  description,
  icon,
  className,
  trend
}: SalesSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className={cn("h-full border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 hover:shadow-md transition-all duration-300", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {!hideAmount && amount !== undefined && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <CardDescription className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(amount)}
                </CardDescription>
              </motion.div>
            )}
            {numericValue !== undefined && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <CardDescription className="text-2xl font-bold text-gray-900 dark:text-white">
                  {numericValue}
                </CardDescription>
              </motion.div>
            )}
          </div>
          {icon && (
            <motion.div 
              className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 p-3 text-primary"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {icon}
            </motion.div>
          )}
        </CardHeader>
        <CardContent>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && trend.value > 0 && (
            <motion.div 
              className={cn(
                "mt-2 text-xs font-medium flex items-center gap-1",
                trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-sm">
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground">vs. mês anterior</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
