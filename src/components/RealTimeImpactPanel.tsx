import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Zap, Clock, DollarSign, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlanner } from '@/contexts/PlannerContext';

export function RealTimeImpactPanel() {
  const { state, undo, redo, autoOptimizeSchedule, calculateTotalRevenue, canUndo, canRedo } = usePlanner();
  const { impact } = state;

  const getRevenueColor = (change: number) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getDeliverabilityColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-warning';
    return 'text-destructive';
  };


  return (
    <div className="space-y-4">
      {/* Revenue Impact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-primary" />
            Impacto na Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Estimado</span>
              <span className="font-bold text-lg">
                R$ {calculateTotalRevenue().toLocaleString()}
              </span>
            </div>
            
            {impact.revenueChange !== 0 && (
              <div className="flex items-center gap-2">
                {impact.revenueChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-sm font-medium ${getRevenueColor(impact.revenueChange)}`}>
                  {impact.revenueChange > 0 ? '+' : ''}R$ {impact.revenueChange.toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground">última alteração</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Frequency & Overlap Monitor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" />
            Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Frequency Cap */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Frequency Cap</span>
              <Badge variant={impact.frequencyCapViolation ? 'destructive' : 'secondary'}>
                {impact.frequencyCapViolation ? 'Violação' : 'OK'}
              </Badge>
            </div>
            
            {/* Overlap Risk */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Risco de Overlap</span>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-16 rounded-full bg-muted overflow-hidden`}>
                  <div 
                    className={`h-full ${impact.overlapRisk > 0.5 ? 'bg-destructive' : impact.overlapRisk > 0.3 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${Math.min(impact.overlapRisk * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(impact.overlapRisk * 100)}%
                </span>
              </div>
            </div>
            
            {/* Deliverability Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deliverability</span>
              <span className={`text-sm font-medium ${getDeliverabilityColor(impact.deliverabilityScore)}`}>
                {impact.deliverabilityScore.toFixed(0)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities & Risks */}
      {(impact.opportunities.length > 0 || impact.risks.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {impact.opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <TrendingUp className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{opportunity}</span>
                </div>
              ))}
              
              {impact.risks.map((risk, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{risk}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto Optimize Button */}
      <Button 
        onClick={autoOptimizeSchedule}
        className="w-full"
        variant="outline"
      >
        <Zap className="h-4 w-4 mr-2" />
        Otimizar Automaticamente
      </Button>

      <Separator />

      {/* Action History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            Histórico de Ações
          </CardTitle>
          <CardDescription className="text-xs">
            Últimas alterações realizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-3">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={undo}
                disabled={!canUndo}
                className="flex-1"
              >
                Desfazer
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={redo}
                disabled={!canRedo}
                className="flex-1"
              >
                Refazer
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-32">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground text-center py-4">
                Histórico disponível através dos botões Desfazer/Refazer
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}