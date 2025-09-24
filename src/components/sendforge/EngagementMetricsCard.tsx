import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EngagementMetrics } from "@/types/sendforge";
import { Mail, MessageSquare, AlertTriangle, Mouse, TrendingUp, TrendingDown } from "lucide-react";

interface EngagementMetricsCardProps {
  metrics: EngagementMetrics;
}

export function EngagementMetricsCard({ metrics }: EngagementMetricsCardProps) {
  const getTrendIcon = (trend: number) => {
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-success' : 'text-destructive';
  };

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Engajamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Opens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-info" />
                <span className="font-medium">Opens</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{metrics.opens.rate}%</span>
                {metrics.opens.trend !== 0 && (
                  <>
                    {getTrendIcon(metrics.opens.trend) === TrendingUp ? 
                      <TrendingUp className={`h-3 w-3 ${getTrendColor(metrics.opens.trend)}`} /> :
                      <TrendingDown className={`h-3 w-3 ${getTrendColor(metrics.opens.trend)}`} />
                    }
                    <span className={`text-xs ${getTrendColor(metrics.opens.trend)}`}>
                      {Math.abs(metrics.opens.trend).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.opens.total.toLocaleString()} aberturas totais
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">Replies</span>
              </div>
              <span className="font-bold">{metrics.replies.total}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IA vs Humano</span>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    IA: {metrics.replies.aiPercentage}%
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Humano: {metrics.replies.humanPercentage}%
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <Progress value={metrics.replies.aiPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>IA: {metrics.replies.ai}</span>
                  <span>Humano: {metrics.replies.human}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clicks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mouse className="h-4 w-4 text-accent" />
                <span className="font-medium">Clicks</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{metrics.clicks.rate}%</span>
                {metrics.clicks.trend !== 0 && (
                  <>
                    {getTrendIcon(metrics.clicks.trend) === TrendingUp ? 
                      <TrendingUp className={`h-3 w-3 ${getTrendColor(metrics.clicks.trend)}`} /> :
                      <TrendingDown className={`h-3 w-3 ${getTrendColor(metrics.clicks.trend)}`} />
                    }
                    <span className={`text-xs ${getTrendColor(metrics.clicks.trend)}`}>
                      {Math.abs(metrics.clicks.trend).toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.clicks.total.toLocaleString()} cliques totais
            </div>
          </div>

          {/* Spam */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium">Spam</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">{(metrics.spam.rate * 100).toFixed(2)}%</span>
                {metrics.spam.trend !== 0 && (
                  <>
                    {getTrendIcon(metrics.spam.trend) === TrendingUp ? 
                      <TrendingUp className={`h-3 w-3 ${getTrendColor(-metrics.spam.trend)}`} /> :
                      <TrendingDown className={`h-3 w-3 ${getTrendColor(-metrics.spam.trend)}`} />
                    }
                    <span className={`text-xs ${getTrendColor(-metrics.spam.trend)}`}>
                      {Math.abs(metrics.spam.trend * 100).toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.spam.complaints} reclamações
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}