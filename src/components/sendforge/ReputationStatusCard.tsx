import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IPPool } from "@/types/sendforge";
import { Server, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface ReputationStatusCardProps {
  pools: IPPool[];
}

export function ReputationStatusCard({ pools }: ReputationStatusCardProps) {
  const getPoolIcon = (type: string) => {
    switch (type) {
      case 'warmup': return '🔥';
      case 'staging': return '⚡';
      case 'production': return '🚀';
      case 'quarantine': return '⚠️';
      default: return '📡';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Server;
    }
  };

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          Status de Reputação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pools.map((pool) => {
            const StatusIcon = getStatusIcon(pool.status);
            return (
              <div key={pool.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPoolIcon(pool.type)}</span>
                    <span className="font-medium">{pool.name}</span>
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(pool.status)}`} />
                  </div>
                  <Badge variant={pool.status === 'healthy' ? 'default' : 'destructive'}>
                    {pool.ips.length} IPs
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uso da capacidade</span>
                    <span className="font-medium">
                      {pool.currentUsage.toLocaleString()} / {pool.capacity.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={pool.usagePercent} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pool.usagePercent}% utilizado</span>
                    <span>Score: {pool.healthScore}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-muted-foreground">
              Uso seguro recomendado: <span className="font-medium text-foreground">10-30% da capacidade</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}