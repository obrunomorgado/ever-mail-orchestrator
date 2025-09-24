import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IPPool } from "@/types/sendforge";
import { Server, ArrowRight, Activity, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface IPKanbanBoardProps {
  pools: IPPool[];
}

export function IPKanbanBoard({ pools }: IPKanbanBoardProps) {
  const [draggedIP, setDraggedIP] = useState<string | null>(null);

  const columns = [
    { id: 'warmup', title: 'Warmup', icon: '🔥', color: 'bg-orange-500/10 border-orange-500/20' },
    { id: 'staging', title: 'Staging', icon: '⚡', color: 'bg-blue-500/10 border-blue-500/20' },
    { id: 'production', title: 'Production', icon: '🚀', color: 'bg-green-500/10 border-green-500/20' },
    { id: 'quarantine', title: 'Quarantine', icon: '⚠️', color: 'bg-red-500/10 border-red-500/20' }
  ];

  const getIPsForColumn = (columnId: string) => {
    const pool = pools.find(p => p.type === columnId);
    return pool ? pool.ips.map(ip => ({
      id: ip,
      address: ip,
      volume: Math.floor(Math.random() * 1000) + 100,
      reputation: Math.floor(Math.random() * 40) + 60,
      lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      status: pool.status
    })) : [];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Server;
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

  const formatLastActivity = (timestamp: string) => {
    const now = new Date();
    const activity = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'agora mesmo';
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${Math.floor(diffHours / 24)}d atrás`;
  };

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          Gestão de IPs
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Arraste os IPs entre as colunas para promover ou rebaixar
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const ips = getIPsForColumn(column.id);
            const pool = pools.find(p => p.type === column.id);
            
            return (
              <div key={column.id} className={`border-2 border-dashed rounded-lg p-4 min-h-[400px] ${column.color}`}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{column.icon}</span>
                    <div>
                      <div className="font-medium">{column.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {ips.length} IPs
                      </div>
                    </div>
                  </div>
                  {pool && (
                    <Badge variant="outline" className="text-xs">
                      {pool.usagePercent}% uso
                    </Badge>
                  )}
                </div>

                {/* IPs */}
                <div className="space-y-3">
                  {ips.map((ip) => {
                    const StatusIcon = getStatusIcon(ip.status);
                    return (
                      <div
                        key={ip.id}
                        draggable
                        onDragStart={() => setDraggedIP(ip.id)}
                        onDragEnd={() => setDraggedIP(null)}
                        className={`bg-card border border-border rounded-lg p-3 cursor-move transition-all hover:shadow-md hover:border-primary/50 ${
                          draggedIP === ip.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <div className="space-y-2">
                          {/* IP Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${getStatusColor(ip.status)}`} />
                              <span className="text-sm font-mono">{ip.address}</span>
                            </div>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Metrics */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Volume/dia</span>
                              <span className="font-medium">{ip.volume.toLocaleString()}</span>
                            </div>
                            
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Reputação</span>
                            <span className={`font-medium ${
                                ip.reputation >= 80 ? 'text-success' : 
                                ip.reputation >= 60 ? 'text-warning' : 'text-destructive'
                              }`}>
                                {ip.reputation}
                              </span>
                            </div>

                            <Progress value={ip.reputation} className="h-1" />
                          </div>

                          {/* Last Activity */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatLastActivity(ip.lastActivity)}
                          </div>

                          {/* Actions */}
                          {column.id !== 'production' && (
                            <Button size="sm" variant="outline" className="w-full text-xs">
                              {column.id === 'quarantine' ? 'Recuperar' : 'Promover'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add IP Button */}
                {column.id === 'warmup' && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-3 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
                  >
                    + Adicionar IP
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Lifecycle Rules */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Lifecycle Manager</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium">Regras de Promoção</div>
              <div className="text-muted-foreground">
                • Reputação > 80 por 48h<br/>
                • Bounce < 2% e Spam < 0.3%<br/>
                • Volume estável
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Regras de Quarentena</div>
              <div className="text-muted-foreground">
                • Bounce > 5% ou Spam > 1%<br/>
                • Reputação < 40<br/>
                • Blacklist detectado
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}