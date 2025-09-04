import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DayMetrics } from '@/types/scheduler';
import { TrendingUp, Target, Users, Zap } from 'lucide-react';

interface TacticalMetricsSummaryProps {
  metrics: DayMetrics;
}

export function TacticalMetricsSummary({ metrics }: TacticalMetricsSummaryProps) {
  return (
    <Card className="border-t-2 border-t-primary">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-center">
          {/* Envios Totais Planejados */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Envios planejados</p>
              <p className="text-lg font-bold">{metrics.totalPlannedSends.toLocaleString()}</p>
            </div>
          </div>

          {/* Base Atingida */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <Target className="h-4 w-4 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Base atingida</p>
              <p className="text-lg font-bold">{metrics.baseReachedPercent}%</p>
            </div>
          </div>

          {/* Interpolação */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Zap className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Interpolação</p>
              <p className="text-lg font-bold">{metrics.interpolationPercent}%</p>
            </div>
          </div>

          {/* Cliques Previstos */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <span className="text-sm">👆</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cliques previstos</p>
              <p className="text-lg font-bold">{metrics.predictedClicks.toLocaleString()}</p>
            </div>
          </div>

          {/* Receita Prevista */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receita prevista</p>
              <p className="text-lg font-bold">R$ {metrics.predictedRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Meta de Cliques */}
          <div className="lg:col-span-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Meta de Cliques</p>
                <p className="text-sm font-medium">{metrics.clickGoalProgress.toFixed(1)}%</p>
              </div>
              <Progress 
                value={metrics.clickGoalProgress} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {metrics.clickGoalProgress >= 100 ? '🎯 Meta atingida!' : 
                 metrics.clickGoalProgress >= 80 ? '🔥 Quase lá!' : 
                 '💪 Continue assim!'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}