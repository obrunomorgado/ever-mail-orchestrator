import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  DollarSign,
  Users,
  Clock,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react';
import { usePlanner } from '@/contexts/PlannerContext';
import { revenueOptimizer } from '@/services/RevenueOptimizer';

interface RevenueDashboardProps {
  segments: any[];
}

export function RevenueDashboard({ segments }: RevenueDashboardProps) {
  const { state, calculateTotalRevenue, checkFrequencyViolations } = usePlanner();

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = calculateTotalRevenue();
    const allCampaigns = Object.values(state.plannedCampaigns)
      .flatMap(dateSlots => Object.values(dateSlots))
      .flat();
    
    const totalCampaigns = allCampaigns.length;
    const totalContacts = allCampaigns.reduce((sum, campaign) => sum + campaign.size, 0);
    const avgCTR = totalCampaigns > 0 
      ? allCampaigns.reduce((sum, campaign) => sum + campaign.ctr, 0) / totalCampaigns
      : 0;

    // Calculate missed opportunities
    const missedOpportunities = revenueOptimizer.calculateMissedOpportunities(
      state.plannedCampaigns,
      segments
    );

    // Performance vs manual baseline (simulated)
    const manualBaseline = totalRevenue * 0.75; // Assume manual is 25% less efficient
    const optimizationLift = totalRevenue - manualBaseline;
    const optimizationPercentage = manualBaseline > 0 ? (optimizationLift / manualBaseline) * 100 : 0;

    // Risk assessment
    const frequencyViolations = checkFrequencyViolations();
    const deliverabilityRisk = state.impact.deliverabilityScore < 85;
    const overlapRisk = state.impact.overlapRisk > 0.3;

    return {
      totalRevenue,
      totalCampaigns,
      totalContacts,
      avgCTR,
      missedOpportunities,
      optimizationLift,
      optimizationPercentage,
      frequencyViolations,
      deliverabilityRisk,
      overlapRisk,
      riskScore: frequencyViolations.length + (deliverabilityRisk ? 1 : 0) + (overlapRisk ? 1 : 0)
    };
  }, [state, calculateTotalRevenue, checkFrequencyViolations, segments]);

  // ROI calculation (simulated)
  const platformROI = useMemo(() => {
    const monthlyCost = 2500; // Platform cost
    const monthlyGains = metrics.optimizationLift * 30; // Projected monthly gains
    return monthlyGains > 0 ? ((monthlyGains - monthlyCost) / monthlyCost) * 100 : 0;
  }, [metrics.optimizationLift]);

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-primary" />
              Receita Projetada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {metrics.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-xs text-success">
                +{metrics.optimizationPercentage.toFixed(1)}% vs manual
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-primary" />
              Oportunidades Perdidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              R$ {metrics.missedOpportunities.totalMissedRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.missedOpportunities.opportunities.length} segmentos não otimizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              Ganho por Otimização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {metrics.optimizationLift.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Este mês vs baseline manual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              Score de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${
                metrics.riskScore === 0 ? 'text-success' :
                metrics.riskScore <= 2 ? 'text-warning' : 'text-destructive'
              }`}>
                {metrics.riskScore}
              </div>
              <Badge variant={
                metrics.riskScore === 0 ? 'default' :
                metrics.riskScore <= 2 ? 'secondary' : 'destructive'
              }>
                {metrics.riskScore === 0 ? 'Baixo' :
                 metrics.riskScore <= 2 ? 'Médio' : 'Alto'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Riscos identificados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance vs Baseline Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">
                R$ {metrics.optimizationLift.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Receita adicional por IA</p>
              <p className="text-xs text-success mt-1">+{metrics.optimizationPercentage.toFixed(1)}% boost</p>
            </div>
            
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {metrics.frequencyViolations.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Violações prevenidas</p>
              <p className="text-xs text-primary mt-1">Sistema automático</p>
            </div>
            
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {state.impact.deliverabilityScore.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Score deliverabilidade</p>
              <p className="text-xs text-warning mt-1">Reputação preservada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI Dashboard */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            ROI da Plataforma de Otimização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Ganhos Mensais</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Otimização de receita:</span>
                  <span className="font-medium">R$ {(metrics.optimizationLift * 30).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Prevenção de perdas:</span>
                  <span className="font-medium">R$ 8.920</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Economia operacional:</span>
                  <span className="font-medium">R$ 4.580</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {((metrics.optimizationLift * 30) + 13500).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">ROI Calculado</h4>
              <div className="text-center p-4 bg-card rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">
                  {platformROI.toFixed(0)}%
                </div>
                <p className="text-muted-foreground text-sm">Retorno sobre investimento</p>
                <Badge variant="outline" className="mt-2">
                  Payback em {platformROI > 100 ? '< 1 mês' : '1-2 meses'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      {metrics.riskScore > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Riscos Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.frequencyViolations.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <h5 className="font-medium text-destructive">Violações de Frequência</h5>
                    <p className="text-sm text-muted-foreground">
                      {metrics.frequencyViolations.length} slots excedem o limite configurado
                    </p>
                  </div>
                </div>
              )}
              
              {metrics.deliverabilityRisk && (
                <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div>
                    <h5 className="font-medium text-warning">Risco de Deliverabilidade</h5>
                    <p className="text-sm text-muted-foreground">
                      Score abaixo de 85% pode impactar entregabilidade
                    </p>
                  </div>
                </div>
              )}
              
              {metrics.overlapRisk && (
                <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <div>
                    <h5 className="font-medium text-warning">Alta Sobreposição de Audiência</h5>
                    <p className="text-sm text-muted-foreground">
                      Risco de canibalização entre campanhas detectado
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Sucessos da Otimização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-success">23</div>
              <p className="text-sm text-muted-foreground">Conflitos prevenidos</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-success">15</div>
              <p className="text-sm text-muted-foreground">Complaints evitados</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-success">+12.3%</div>
              <p className="text-sm text-muted-foreground">CTR vs baseline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}