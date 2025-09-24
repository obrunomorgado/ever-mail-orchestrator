import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityLog } from "@/types/sendforge";
import { Clock, Bot, User, Filter, Download } from "lucide-react";
import { useState } from "react";

interface ActivityLogTimelineProps {
  activityLog: ActivityLog[];
}

export function ActivityLogTimeline({ activityLog }: ActivityLogTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'auto' | 'manual'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');

  const filteredLogs = activityLog.filter(log => {
    const typeMatch = filter === 'all' || log.type === filter;
    const severityMatch = severityFilter === 'all' || log.severity === severityFilter;
    return typeMatch && severityMatch;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTypeIcon = (type: string) => {
    return type === 'auto' ? Bot : User;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'info': return 'text-info';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const getActionEmoji = (action: string) => {
    if (action.toLowerCase().includes('promotion')) return '⬆️';
    if (action.toLowerCase().includes('quarantine')) return '🚨';
    if (action.toLowerCase().includes('reduction')) return '⬇️';
    if (action.toLowerCase().includes('pause')) return '⏸️';
    return '📋';
  };

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Log de Atividades
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="text-xs"
            >
              Todos
            </Button>
            <Button
              size="sm"
              variant={filter === 'auto' ? 'default' : 'outline'}
              onClick={() => setFilter('auto')}
              className="text-xs"
            >
              Auto
            </Button>
            <Button
              size="sm"
              variant={filter === 'manual' ? 'default' : 'outline'}
              onClick={() => setFilter('manual')}
              className="text-xs"
            >
              Manual
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={severityFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSeverityFilter('all')}
              className="text-xs"
            >
              Todos
            </Button>
            <Button
              size="sm"
              variant={severityFilter === 'critical' ? 'destructive' : 'outline'}
              onClick={() => setSeverityFilter('critical')}
              className="text-xs"
            >
              Crítico
            </Button>
            <Button
              size="sm"
              variant={severityFilter === 'warning' ? 'default' : 'outline'}
              onClick={() => setSeverityFilter('warning')}
              className="text-xs"
            >
              Alerta
            </Button>
          </div>

          <Button size="sm" variant="outline" className="gap-1">
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filteredLogs.map((log, index) => {
              const TypeIcon = getTypeIcon(log.type);
              const timestamp = formatTimestamp(log.timestamp);
              
              return (
                <div key={log.id} className="relative">
                  {/* Timeline line */}
                  {index < filteredLogs.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-card border-2 border-border">
                      <TypeIcon className={`h-5 w-5 ${log.type === 'auto' ? 'text-primary' : 'text-accent'}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getActionEmoji(log.action)}</span>
                          <span className="font-medium">{log.action}</span>
                          <Badge variant={getSeverityBadge(log.severity) as any} className="text-xs">
                            {log.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {timestamp.date} às {timestamp.time}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Alvo:</span>{' '}
                          <span className="font-mono text-foreground">{log.target}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.reason}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={log.type === 'auto' ? 'default' : 'secondary'} className="text-xs">
                          {log.type === 'auto' ? 'Automático' : 'Manual'}
                        </Badge>
                        {log.type === 'auto' && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Bot className="h-3 w-3" />
                            <span>Sistema</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="font-bold text-primary">
              {activityLog.filter(log => log.type === 'auto').length}
            </div>
            <div className="text-xs text-muted-foreground">Automáticas</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-accent-foreground">
              {activityLog.filter(log => log.type === 'manual').length}
            </div>
            <div className="text-xs text-muted-foreground">Manuais</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-destructive">
              {activityLog.filter(log => log.severity === 'critical').length}
            </div>
            <div className="text-xs text-muted-foreground">Críticas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}