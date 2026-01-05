
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  variant?: "kpi" | "chart" | "table";
}

export function SkeletonCard({ className, variant = "kpi" }: SkeletonCardProps) {
  if (variant === "kpi") {
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-3 w-20 bg-muted rounded skeleton-animate" />
              <div className="h-7 w-32 bg-muted rounded skeleton-animate" />
              <div className="h-3 w-24 bg-muted rounded skeleton-animate" />
            </div>
            <div className="w-10 h-10 bg-muted rounded-lg skeleton-animate" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "chart") {
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-40 bg-muted rounded skeleton-animate" />
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded skeleton-animate" />
        </CardContent>
      </Card>
    );
  }

  if (variant === "table") {
    return (
      <Card className={cn("border-0 shadow-sm", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-40 bg-muted rounded skeleton-animate" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-1/4 bg-muted rounded skeleton-animate" />
                <div className="h-4 w-1/6 bg-muted rounded skeleton-animate" />
                <div className="h-4 w-1/4 bg-muted rounded skeleton-animate" />
                <div className="h-4 w-1/6 bg-muted rounded skeleton-animate" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
