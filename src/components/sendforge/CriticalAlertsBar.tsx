import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertThreshold } from "@/types/sendforge";
import { AlertTriangle, X, Eye, Pause } from "lucide-react";
import { useState } from "react";

interface CriticalAlertsBarProps {
  alerts: AlertThreshold[];
}

export function CriticalAlertsBar({ alerts }: CriticalAlertsBarProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  
  const criticalAlerts = alerts.filter(
    alert => alert.status === 'critical' && !dismissed.includes(alert.metric)
  );
  
  const warningAlerts = alerts.filter(
    alert => alert.status === 'warning' && !dismissed.includes(alert.metric)
  );

  const allActiveAlerts = [...criticalAlerts, ...warningAlerts];

  if (allActiveAlerts.length === 0) {
    return null;
  }

  const handleDismiss = (metric: string) => {
    setDismissed(prev => [...prev, metric]);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      default: return 'secondary';
    }
  };

  const getAlertIcon = (status: string) => {
    return status === 'critical' ? '🚨' : '⚠️';
  };

  return (
    <div className="space-y-2 mb-6">
      {allActiveAlerts.map((alert) => (
        <Alert 
          key={alert.metric}
          variant={alert.status === 'critical' ? 'destructive' : 'default'}
          className="border-l-4"
        >
          <AlertTriangle className="h-4 w-4" />
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <span className="text-lg">{getAlertIcon(alert.status)}</span>
              <AlertDescription className="flex items-center gap-2">
                <span className="font-medium">{alert.metric}:</span>
                <span>{alert.currentValue}%</span>
                <span className="text-muted-foreground">
                  (threshold: {alert.threshold}%)
                </span>
                <Badge variant={getBadgeVariant(alert.status)}>
                  {alert.status.toUpperCase()}
                </Badge>
              </AlertDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {alert.status === 'critical' && (
                <Button size="sm" variant="outline" className="gap-1">
                  <Pause className="h-3 w-3" />
                  Pausar Envios
                </Button>
              )}
              <Button size="sm" variant="ghost" className="gap-1">
                <Eye className="h-3 w-3" />
                Ver Detalhes
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleDismiss(alert.metric)}
                className="p-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}