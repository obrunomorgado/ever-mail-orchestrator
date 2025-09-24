import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadBalanceConfig } from "@/types/sendforge";
import { Scale, Settings, Activity, Timer, Shuffle, Target } from "lucide-react";
import { useState } from "react";

interface LoadBalancerVisualProps {
  config: LoadBalanceConfig;
}

export function LoadBalancerVisual({ config }: LoadBalancerVisualProps) {
  const [localConfig, setLocalConfig] = useState(config);

  const updateConfig = (updates: Partial<LoadBalanceConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  const utilizationPercent = (localConfig.volumePerDomain / localConfig.hourlyLimit) * 100;

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Multi-Domínio & Load Balancer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Visual Balance */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {localConfig.totalDailyVolume.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">envios/dia</div>
              </div>
              
              <div className="flex items-center gap-2">
                <Scale className="h-8 w-8 text-muted-foreground" />
                <span className="text-lg font-medium">→</span>
              </div>
              
              <div className="text-left">
                <div className="text-2xl font-bold text-accent-foreground">
                  {localConfig.domainsCount}
                </div>
                <div className="text-sm text-muted-foreground">domínios</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-sm">
                {localConfig.volumePerDomain} envios por domínio
              </span>
            </div>

            {/* Distribution visualization */}
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: Math.min(localConfig.domainsCount, 25) }, (_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-12 bg-primary/20 rounded flex items-end justify-center">
                    <div 
                      className="w-full bg-primary rounded-b transition-all duration-1000"
                      style={{ 
                        height: `${Math.random() * 60 + 40}%`,
                        animation: `pulse 2s infinite ${i * 0.1}s`
                      }}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    D{i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Configurações</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Limite por conta/dia</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={localConfig.volumePerDomain}
                    onChange={(e) => updateConfig({ volumePerDomain: parseInt(e.target.value) })}
                    className="flex-1 px-3 py-1 text-sm border border-border rounded-md bg-background"
                  />
                  <span className="text-sm text-muted-foreground">envios</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Throttling por hora</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={localConfig.hourlyLimit}
                    onChange={(e) => updateConfig({ hourlyLimit: parseInt(e.target.value) })}
                    className="flex-1 px-3 py-1 text-sm border border-border rounded-md bg-background"
                  />
                  <span className="text-sm text-muted-foreground">envios/h</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Throttling automático</span>
                </div>
                <Switch 
                  checked={localConfig.throttlingEnabled}
                  onCheckedChange={(checked) => updateConfig({ throttlingEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Random pacing</span>
                </div>
                <Switch 
                  checked={localConfig.randomPacingEnabled}
                  onCheckedChange={(checked) => updateConfig({ randomPacingEnabled: checked })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estratégia de distribuição</label>
              <div className="flex gap-2">
                {['even', 'weighted', 'capacity-based'].map((strategy) => (
                  <Button
                    key={strategy}
                    size="sm"
                    variant={localConfig.distributionStrategy === strategy ? 'default' : 'outline'}
                    onClick={() => updateConfig({ distributionStrategy: strategy as any })}
                    className="text-xs"
                  >
                    {strategy === 'even' && 'Uniforme'}
                    {strategy === 'weighted' && 'Ponderada'}
                    {strategy === 'capacity-based' && 'Por Capacidade'}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Utilization Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Utilização por hora</span>
              <span className="text-sm font-medium">{utilizationPercent.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{localConfig.volumePerDomain} atual</span>
              <span>{localConfig.hourlyLimit} limite</span>
            </div>
          </div>

          {/* Health Indicator */}
          <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Activity className="h-4 w-4 text-success" />
            <span className="text-sm">
              {utilizationPercent < 80 ? (
                <span className="text-success">Distribuição otimizada</span>
              ) : (
                <span className="text-warning">Próximo ao limite</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}