import React, { useMemo } from 'react';
import { Clock, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';

interface BestTimeWidgetProps {
  audienceId: string;
  className?: string;
}

const BestTimeWidget = React.memo(({ audienceId, className }: BestTimeWidgetProps) => {
  const { getBestTimeInsights, audiences } = useData();
  
  const audience = useMemo(() => 
    audiences.find(a => a.id === audienceId), 
    [audiences, audienceId]
  );
  
  const insights = useMemo(() => 
    getBestTimeInsights(audienceId), 
    [getBestTimeInsights, audienceId]
  );
  
  if (!audience) return null;

  const getStatusColor = () => {
    if (insights.confidence >= 0.7) return 'text-success';
    if (insights.confidence >= 0.4) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusIcon = () => {
    if (insights.confidence >= 0.7) return TrendingUp;
    if (insights.confidence >= 0.4) return Clock;
    return AlertTriangle;
  };

  const StatusIcon = getStatusIcon();

  const formatTime = (hour: number) => {
    const time = new Date();
    time.setHours(hour, 0, 0, 0);
    return time.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          Send-Time Optimization
          <Badge variant="secondary" className="text-xs">
            Predictive
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-4 w-4 ${getStatusColor()}`} />
            <span className="text-sm font-medium">
              Optimal Time: {formatTime(insights.optimalHour)}
            </span>
          </div>
          <Badge 
            variant={insights.confidence >= 0.7 ? 'default' : insights.confidence >= 0.4 ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {Math.round(insights.confidence * 100)}% confidence
          </Badge>
        </div>

        {insights.expectedLift > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-success" />
            <span>Expected lift: +{insights.expectedLift}% open rate</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>
            Based on {audience.contacts.length} contacts
            {insights.fallbackReason && (
              <span className="text-warning"> • {
                insights.fallbackReason === 'insufficient-data' ? 'Using global fallback' :
                insights.fallbackReason === 'partial-data' ? 'Limited historical data' :
                'Unknown fallback'
              }</span>
            )}
          </span>
        </div>

        {insights.confidence < 0.4 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            💡 <strong>Tip:</strong> More email interactions will improve timing predictions for this audience.
          </div>
        )}
      </CardContent>
    </Card>
  );
});

BestTimeWidget.displayName = 'BestTimeWidget';

export { BestTimeWidget };