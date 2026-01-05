
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCountUp, useCountUpCurrency } from "@/hooks/useCountUp";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type KPIVariant = "default" | "blue" | "green" | "purple" | "amber";

interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: KPIVariant;
  format?: "currency" | "number" | "percentage";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  tooltip?: string;
  className?: string;
}

const variantStyles: Record<KPIVariant, { bg: string; icon: string; text: string }> = {
  default: {
    bg: "bg-card",
    icon: "bg-muted text-muted-foreground",
    text: "text-foreground"
  },
  blue: {
    bg: "bg-[hsl(var(--kpi-blue-bg))]",
    icon: "bg-[hsl(var(--kpi-blue)/0.15)] text-[hsl(var(--kpi-blue))]",
    text: "text-[hsl(var(--kpi-blue))]"
  },
  green: {
    bg: "bg-[hsl(var(--kpi-green-bg))]",
    icon: "bg-[hsl(var(--kpi-green)/0.15)] text-[hsl(var(--kpi-green))]",
    text: "text-[hsl(var(--kpi-green))]"
  },
  purple: {
    bg: "bg-[hsl(var(--kpi-purple-bg))]",
    icon: "bg-[hsl(var(--kpi-purple)/0.15)] text-[hsl(var(--kpi-purple))]",
    text: "text-[hsl(var(--kpi-purple))]"
  },
  amber: {
    bg: "bg-[hsl(var(--kpi-amber-bg))]",
    icon: "bg-[hsl(var(--kpi-amber)/0.15)] text-[hsl(var(--kpi-amber))]",
    text: "text-[hsl(var(--kpi-amber))]"
  }
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  format = "number",
  trend,
  tooltip,
  className
}: KPICardProps) {
  const styles = variantStyles[variant];
  
  const formattedValue = format === "currency" 
    ? useCountUpCurrency(value)
    : format === "percentage"
    ? `${useCountUp(value * 100, { decimals: 1 })}%`
    : useCountUp(value);

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "border-0 shadow-sm hover-lift",
        styles.bg,
        className
      )}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="kpi-label">{title}</p>
              <div className="flex items-baseline gap-2">
                <span className={cn("kpi-value", styles.text)}>
                  {formattedValue}
                </span>
                {trend && (
                  <span className={cn(
                    "text-xs font-medium flex items-center gap-0.5",
                    trend.isPositive ? "text-success" : "text-destructive"
                  )}>
                    {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className={cn(
              "p-2.5 rounded-lg",
              styles.icon
            )}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
