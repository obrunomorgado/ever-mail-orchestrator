import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: number;
  suffix?: string;
  className?: string;
}

export function MetricCard({ title, value, delta, suffix = "", className }: MetricCardProps) {
  const renderDelta = () => {
    if (delta === undefined) return null;
    
    const isPositive = delta > 0;
    const isNeutral = delta === 0;
    
    return (
      <div className={cn(
        "flex items-center gap-1 text-xs",
        isPositive ? "text-success" : isNeutral ? "text-muted-foreground" : "text-destructive"
      )}>
        {isNeutral ? (
          <Minus className="w-3 h-3" />
        ) : isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {Math.abs(delta).toFixed(2)}{suffix}
      </div>
    );
  };

  return (
    <Card className={cn("kpi-card", className)}>
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="kpi-label">{title}</p>
          <div className="flex items-center justify-between">
            <span className="kpi-value">{value}{suffix}</span>
            {renderDelta()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}