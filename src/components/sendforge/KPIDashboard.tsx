import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { KPIMetrics, AlertThreshold } from "@/types/sendforge";
import { Activity, TrendingUp, TrendingDown, Settings, AlertTriangle, CheckCircle, Mail } from "lucide-react";
import { useState } from "react";

interface KPIDashboardProps {
  kpis: KPIMetrics;
  alerts: AlertThreshold[];
}

export function KPIDashboard({ kpis, alerts }: KPIDashboardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [thresholds, setThresholds] = useState({
    hardBounce: 2.0,
    softBounce: 5.0,
    spam: 0.3,
    postmaster: 80
  });

  const kpiCards = [
    {
      key: 'hardBounce',
      title: 'Hard Bounce',
      value: kpis.hardBounceRate,
      threshold: thresholds.hardBounce,
      format: (v: number) => `${v.toFixed(2)}%`,
      status: kpis.hardBounceRate > thresholds.hardBounce ? 'critical' : 
              kpis.hardBounceRate > thresholds.hardBounce * 0.8 ? 'warning' : 'normal',
      icon: AlertTriangle,
      description: 'Emails rejeitados permanentemente'
    },
    {
      key: 'softBounce',
      title: 'Soft Bounce',
      value: kpis.softBounceRate,
      threshold: thresholds.softBounce,
      format: (v: number) => `${v.toFixed(1)}%`,
      status: kpis.softBounceRate > thresholds.softBounce ? 'critical' : 
              kpis.softBounceRate > thresholds.softBounce * 0.8 ? 'warning' : 'normal',
      icon: Activity,
      description: 'Emails rejeitados temporariamente'
    },
    {
      key: 'spam',
      title: 'Spam Complaints',
      value: kpis.spamComplaintRate,
      threshold: thresholds.spam,
      format: (v: number) => `${(v * 100).toFixed(2)}%`,
      status: kpis.spamComplaintRate > thresholds.spam / 100 ? 'critical' : 
              kpis.spamComplaintRate > (thresholds.spam / 100) * 0.8 ? 'warning' : 'normal',
      icon: AlertTriangle,
      description: 'Reclamações de spam recebidas'
    },
    {
      key: 'postmaster',
      title: 'Gmail Postmaster',
      value: kpis.gmailPostmasterScore,
      threshold: thresholds.postmaster,
      format: (v: number) => `${Math.round(v)}`,
      status: kpis.gmailPostmasterScore < thresholds.postmaster ? 'critical' : 
              kpis.gmailPostmasterScore < thresholds.postmaster * 1.1 ? 'warning' : 'normal',
      icon: Mail,
      description: 'Score de reputação no Gmail',
      inverted: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'normal': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'normal': return 'secondary';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
  };

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Monitoramento & KPIs
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Thresholds
          </Button>
          <div className="flex items-center gap-1">
            {getTrendIcon(kpis.reputationTrend) === TrendingUp ? 
              <TrendingUp className={`h-4 w-4 ${getTrendColor(kpis.reputationTrend)}`} /> :
              getTrendIcon(kpis.reputationTrend) === TrendingDown ?
              <TrendingDown className={`h-4 w-4 ${getTrendColor(kpis.reputationTrend)}`} /> :
              <Activity className={`h-4 w-4 ${getTrendColor(kpis.reputationTrend)}`} />
            }
            <span className="text-sm text-muted-foreground">
              Reputação {kpis.reputationTrend === 'up' ? 'melhorando' : kpis.reputationTrend === 'down' ? 'degradando' : 'estável'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border border-border rounded-lg space-y-4 bg-muted/30">
              <div className="font-medium">Configurar Alertas</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Hard Bounce Threshold</label>
                  <Slider
                    value={[thresholds.hardBounce]}
                    onValueChange={(value) => setThresholds(prev => ({ ...prev, hardBounce: value[0] }))}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{thresholds.hardBounce.toFixed(1)}%</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Spam Complaint Threshold</label>
                  <Slider
                    value={[thresholds.spam]}
                    onValueChange={(value) => setThresholds(prev => ({ ...prev, spam: value[0] }))}
                    max={2}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">{thresholds.spam.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi) => {
              const IconComponent = kpi.icon;
              const progressValue = kpi.inverted ? 
                kpi.value : 
                Math.min((kpi.value / kpi.threshold) * 100, 100);

              return (
                <div key={kpi.key} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <IconComponent className={`h-4 w-4 ${getStatusColor(kpi.status)}`} />
                    <Badge variant={getStatusBadge(kpi.status) as any} className="text-xs">
                      {kpi.status === 'normal' ? 'OK' : kpi.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className={`text-xl font-bold ${getStatusColor(kpi.status)}`}>
                      {kpi.format(kpi.value)}
                    </div>
                    <div className="text-sm font-medium">{kpi.title}</div>
                    <div className="text-xs text-muted-foreground">{kpi.description}</div>
                  </div>

                  <div className="space-y-1">
                    <Progress 
                      value={progressValue} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{kpi.format(kpi.value)}</span>
                      <span>Limite: {kpi.format(kpi.threshold)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Score */}
          <div className="p-4 border border-border rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {kpis.deliverabilityScore.toFixed(1)}
              </div>
              <div className="text-sm font-medium">Deliverabilidade Score</div>
              <Progress value={kpis.deliverabilityScore} className="h-3" />
              <div className="text-xs text-muted-foreground">
                Score geral baseado em todas as métricas
              </div>
            </div>
          </div>

          {/* Active Alerts Summary */}
          <div className="space-y-3">
            <div className="font-medium">Alertas Ativos</div>
            {alerts.filter(a => a.status !== 'normal').length === 0 ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Todas as métricas dentro dos parâmetros</span>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.filter(a => a.status !== 'normal').map((alert) => (
                  <div key={alert.metric} className="flex items-center justify-between p-2 border border-border rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${getStatusColor(alert.status)}`} />
                      <span className="text-sm">{alert.metric}</span>
                    </div>
                    <Badge variant={getStatusBadge(alert.status) as any} className="text-xs">
                      {alert.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}