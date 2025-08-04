import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MailWarning, 
  Filter, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useDeliverability, ProtectionMetric } from '@/hooks/useDeliverability';
import { useIsMobile } from '@/hooks/use-mobile';

function StatusIcon({ status }: { status: 'ok' | 'warning' | 'critical' }) {
  switch (status) {
    case 'ok':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-red-500" />;
    case 'down':
      return <TrendingDown className="h-3 w-3 text-green-500" />;
    case 'stable':
      return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
}

function ProtectionCard({ metric, onThresholdChange, onToggle }: {
  metric: ProtectionMetric;
  onThresholdChange: (value: number) => void;
  onToggle: () => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950';
      default: return 'border-border';
    }
  };

  const getIcon = () => {
    switch (metric.id) {
      case 'spam': return <ShieldAlert className="h-5 w-5 text-primary" />;
      case 'bounce': return <MailWarning className="h-5 w-5 text-primary" />;
      case 'frequency': return <Clock className="h-5 w-5 text-primary" />;
      case 'overlap': return <Filter className="h-5 w-5 text-primary" />;
      case 'optimize': return <TrendingUp className="h-5 w-5 text-primary" />;
      default: return <ShieldAlert className="h-5 w-5 text-primary" />;
    }
  };

  const formatValue = (value: number) => {
    if (metric.unit === '%') return `${value.toFixed(2)}%`;
    if (metric.unit === '% lift médio') return `+${value.toFixed(1)}%`;
    return `${value.toFixed(1)} ${metric.unit}`;
  };

  return (
    <Card className={`transition-all duration-200 ${getStatusColor(metric.status)} ${!metric.enabled ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base">{metric.name}</CardTitle>
            <StatusIcon status={metric.status} />
          </div>
          <div className="flex items-center gap-2">
            <TrendIcon trend={metric.trend} />
            <Switch
              checked={metric.enabled}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
        <CardDescription className="text-sm">
          {metric.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Metric Value */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(metric.value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Limite: {formatValue(metric.threshold)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Status Badge */}
        <Badge 
          variant={
            metric.status === 'critical' ? 'destructive' : 
            metric.status === 'warning' ? 'secondary' : 'default'
          }
          className="text-xs"
        >
          {metric.status === 'ok' && 'Normal'}
          {metric.status === 'warning' && 'Atenção'}
          {metric.status === 'critical' && 'Crítico'}
        </Badge>

        {/* Settings Panel */}
        {showSettings && (
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Limite: {formatValue(metric.threshold)}
              </label>
              <Slider
                value={[metric.threshold]}
                onValueChange={([value]) => onThresholdChange(value)}
                min={0.1}
                max={metric.id === 'optimize' ? 20 : 10}
                step={0.1}
                className="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Última verificação: {new Date(metric.lastCheck).toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DeliverabilityShield() {
  const { state, overallStatus, updateThreshold, toggleMetric, togglePolling, refreshMetrics } = useDeliverability();
  const isMobile = useIsMobile();

  const getOverallStatusText = () => {
    switch (overallStatus) {
      case 'ok': return 'Todas as métricas OK';
      case 'warning': return 'Atenção: Proteções ativadas';
      case 'critical': return 'Crítico: Ação necessária';
      default: return 'Status desconhecido';
    }
  };

  const getOverallStatusIcon = () => {
    switch (overallStatus) {
      case 'ok': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const metrics = [state.spamGuard, state.bounceGuard, state.frequencyShield, state.overlapShield, state.autoOptimize];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Proteções de Entregabilidade
          </h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real • Gmail & SendGrid • Automações preventivas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          
          <Badge variant={state.isPolling ? 'default' : 'secondary'}>
            {state.isPolling ? 'Monitorando' : 'Pausado'}
          </Badge>
        </div>
      </div>

      {/* Overall Status Alert */}
      <Alert className={`${
        overallStatus === 'critical' ? 'border-red-500' : 
        overallStatus === 'warning' ? 'border-yellow-500' : 'border-green-500'
      }`}>
        {getOverallStatusIcon()}
        <AlertDescription className="flex items-center justify-between">
          <span className="font-medium">{getOverallStatusText()}</span>
          <span className="text-sm text-muted-foreground">
            Última atualização: {new Date(state.lastUpdate).toLocaleTimeString()}
          </span>
        </AlertDescription>
      </Alert>

      {/* Protection Cards Grid */}
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      }`}>
        {metrics.map((metric) => (
          <ProtectionCard
            key={metric.id}
            metric={metric}
            onThresholdChange={(value) => updateThreshold(metric.id, value)}
            onToggle={() => toggleMetric(metric.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={togglePolling}
                className="flex items-center gap-2"
              >
                {state.isPolling ? 'Pausar Monitoramento' : 'Iniciar Monitoramento'}
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="text-sm text-muted-foreground">
                Polling a cada 15 min • Console logs ativos
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Powered by Gmail Postmaster & SendGrid API</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}