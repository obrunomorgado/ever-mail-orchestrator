import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Clock,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Shield
} from 'lucide-react';
import { usePlanner, CampaignSegment } from '@/contexts/PlannerContext';
import { revenueOptimizer, SlotRecommendation, OptimizationGoal } from '@/services/RevenueOptimizer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RevenueOptimizedPlannerProps {
  segments: CampaignSegment[];
  timeSlots: string[];
}

export function RevenueOptimizedPlanner({ segments, timeSlots }: RevenueOptimizedPlannerProps) {
  const { state, createSlot, calculateTotalRevenue } = usePlanner();
  const { toast } = useToast();
  const [selectedSegment, setSelectedSegment] = useState<CampaignSegment | null>(null);
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>({
    type: 'revenue',
    priority: 1,
    constraints: {
      maxAudienceOverlap: 0.3,
      minDeliverabilityScore: 85,
      maxFrequencyPerDay: 2
    }
  });

  // Generate available slots for next 7 days
  const availableSlots = useMemo(() => {
    const slots = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      for (const timeSlot of timeSlots) {
        const existingCampaigns = state.plannedCampaigns[dateStr]?.[timeSlot] || [];
        if (existingCampaigns.length < 2) { // Allow up to 2 campaigns per slot
          slots.push({ date: dateStr, timeSlot });
        }
      }
    }
    
    return slots;
  }, [timeSlots, state.plannedCampaigns]);

  // Get recommendations for selected segment
  const recommendations = useMemo(() => {
    if (!selectedSegment) return [];
    
    return revenueOptimizer.recommendBestSlots(
      selectedSegment,
      optimizationGoal,
      state.plannedCampaigns,
      availableSlots
    );
  }, [selectedSegment, optimizationGoal, state.plannedCampaigns, availableSlots]);

  // Calculate missed opportunities
  const missedOpportunities = useMemo(() => {
    return revenueOptimizer.calculateMissedOpportunities(
      state.plannedCampaigns,
      segments
    );
  }, [state.plannedCampaigns, segments]);

  const handleScheduleCampaign = (recommendation: SlotRecommendation) => {
    if (!selectedSegment) return;
    
    createSlot(
      recommendation.slot.date,
      recommendation.slot.timeSlot,
      selectedSegment.id
    );
    
    toast({
      title: "Campanha Otimizada Agendada",
      description: `Receita estimada: R$ ${recommendation.estimatedRevenue.toLocaleString()}`,
      duration: 3000
    });
    
    setSelectedSegment(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue-First Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Planner Otimizado por Receita
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                IA recomenda os melhores slots baseado em performance histórica e potencial de receita
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                R$ {calculateTotalRevenue().toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Receita Total Planejada</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Optimization Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4" />
            Objetivo de Otimização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['revenue', 'reach', 'engagement', 'balanced'] as const).map((goal) => (
              <Button
                key={goal}
                variant={optimizationGoal.type === goal ? "default" : "outline"}
                size="sm"
                onClick={() => setOptimizationGoal({ ...optimizationGoal, type: goal })}
                className="capitalize"
              >
                {goal === 'revenue' && <DollarSign className="h-3 w-3 mr-1" />}
                {goal === 'reach' && <Users className="h-3 w-3 mr-1" />}
                {goal === 'engagement' && <TrendingUp className="h-3 w-3 mr-1" />}
                {goal === 'balanced' && <Target className="h-3 w-3 mr-1" />}
                {goal === 'revenue' ? 'Receita' : 
                 goal === 'reach' ? 'Alcance' : 
                 goal === 'engagement' ? 'Engajamento' : 'Balanceado'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Segmentos para Otimizar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-all hover:bg-accent",
                    selectedSegment?.id === segment.id && "border-primary bg-primary/5"
                  )}
                  onClick={() => setSelectedSegment(segment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{segment.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {(segment.size / 1000).toFixed(0)}k
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          CTR: {(segment.ctr * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-primary font-medium mt-1">
                        Receita potencial: R$ {(segment.size * segment.ctr * segment.erpm).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Smart Recommendations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recomendações Inteligentes
              {selectedSegment && (
                <Badge variant="outline" className="ml-2">
                  {selectedSegment.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedSegment ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um segmento para ver recomendações otimizadas</p>
              </div>
            ) : recommendations.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum slot disponível encontrado. Verifique se há horários livres nos próximos dias.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <Card key={index} className="border-2 hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            #{index + 1} Recomendação
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm font-medium">
                              {new Date(rec.slot.date).toLocaleDateString()} às {rec.slot.timeSlot}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleScheduleCampaign(rec)}
                          className="flex items-center gap-1"
                        >
                          Agendar
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">
                            R$ {rec.estimatedRevenue.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">Receita Estimada</p>
                        </div>
                        <div className="text-center">
                          <div className={cn("text-lg font-bold", getConfidenceColor(rec.confidence))}>
                            {(rec.confidence * 100).toFixed(0)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Confiança</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {rec.estimatedClicks.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">Cliques Est.</p>
                        </div>
                      </div>

                      {/* Reasons */}
                      {rec.reasons.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium mb-1">Por que este slot?</h5>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {rec.reasons.map((reason, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Risks */}
                      {rec.risks.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-1 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Riscos Identificados
                          </h5>
                          <div className="space-y-2">
                            {rec.risks.map((risk, i) => (
                              <Alert key={i} className="py-2">
                                <AlertTriangle className={cn("h-3 w-3", getRiskSeverityColor(risk.severity))} />
                                <AlertDescription className="text-xs">
                                  <span className={getRiskSeverityColor(risk.severity)}>
                                    {risk.description}
                                  </span>
                                  <span className="text-muted-foreground ml-2">
                                    (Impacto: -{(risk.impact.revenueReduction * 100).toFixed(0)}% receita)
                                  </span>
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Missed Opportunities Alert */}
      {missedOpportunities.totalMissedRevenue > 0 && (
        <Alert className="border-warning">
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>R$ {missedOpportunities.totalMissedRevenue.toLocaleString()}</strong> em receita 
                não otimizada detectada com {missedOpportunities.opportunities.length} segmentos não agendados.
              </span>
              <Button variant="outline" size="sm">
                Ver Oportunidades
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}