import React, { useEffect, useState } from 'react';
import { Calendar, Mic, MicOff, Brain, Gauge, Target, ShieldAlert, Zap, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlannerProvider, usePlanner } from '@/contexts/PlannerContext';
import { RealTimeImpactPanel } from '@/components/RealTimeImpactPanel';
import { SmartDragDrop } from '@/components/SmartDragDrop';
import { CalendarView } from '@/components/CalendarView';
import { CalendarGridView } from '@/components/CalendarGridView';
import { DeliverabilityShield } from '@/components/DeliverabilityShield';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { usePlannerDefaults } from '@/hooks/usePlannerDefaults';
import { segments } from '@/mocks/demoData';
import { useIsMobile } from '@/hooks/use-mobile';

const timeSlots = ['07:00', '09:00', '12:00', '15:00', '18:00'];

function SmartPlannerContent() {
  const { 
    state, 
    calculateTotalRevenue, 
    checkFrequencyViolations,
    setDailyClickGoal,
    setCoolDown,
    setAnchorTimes
  } = usePlanner();
  const { isListening, isSupported, startListening, stopListening, commands } = useVoiceCommands();
  const { defaults, isLoading: defaultsLoading, generateInitialPlan } = usePlannerDefaults();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('planner');
  
  console.log('[Planner] SmartPlannerContent rendering with defaults:', defaults);
  
  // Initialize defaults when loaded
  useEffect(() => {
    if (!defaultsLoading && defaults) {
      console.log('[Planner] Applying calculated defaults');
      setDailyClickGoal(defaults.dailyClickGoal);
      setCoolDown(defaults.coolDown);
      setAnchorTimes(defaults.anchorTimes);
    }
  }, [defaultsLoading, defaults, setDailyClickGoal, setCoolDown, setAnchorTimes]);

  const allCampaigns = Object.values(state.plannedCampaigns)
    .flatMap(dateSlots => Object.values(dateSlots))
    .flat();
  
  const totalCampaigns = allCampaigns.length;
  const totalContacts = allCampaigns.reduce((sum, campaign) => sum + campaign.size, 0);
  
  const avgCTR = totalCampaigns > 0 
    ? allCampaigns.reduce((sum, campaign) => sum + campaign.ctr, 0) / totalCampaigns * 100
    : 0;

  const frequencyViolations = checkFrequencyViolations();
  const hasViolations = frequencyViolations.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">Central de Planejamento Inteligente</h1>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Otimização em tempo real • Mobile-first • Automações preventivas
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Voice Commands */}
              {isSupported && (
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  className="flex items-center gap-2"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isListening ? 'Parar' : 'Comando de Voz'}
                </Button>
              )}
              
              {/* Revenue Display */}
              <div className="text-right">
                <div className="text-xl lg:text-2xl font-bold text-primary">
                  R$ {calculateTotalRevenue().toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Receita Total Estimada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {!isMobile && 'Grid'}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {!isMobile && 'Calendário'}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              {!isMobile && 'Analytics'}
            </TabsTrigger>
            <TabsTrigger value="protection" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              {!isMobile && 'Proteções'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Main Calendar Grid Area */}
              <CalendarGridView segments={segments} timeSlots={timeSlots} />
              
              {/* Impact Panel Below */}
              <div className="max-w-4xl mx-auto">
                <RealTimeImpactPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            {defaultsLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Carregando configurações padrão...</p>
                </CardContent>
              </Card>
            ) : (
              <CalendarView segments={segments} />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    Campanhas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    {hasViolations ? `${frequencyViolations.length} violação(ões)` : 'Dentro do limite'}
                  </p>
                  {hasViolations && (
                    <Badge variant="destructive" className="mt-1 text-xs">Atenção</Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    Total de Contatos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalContacts.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Alcance total estimado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Gauge className="h-4 w-4 text-primary" />
                    CTR Médio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgCTR.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Taxa de clique média</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-primary" />
                    Score de Deliverabilidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{state.impact.deliverabilityScore.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">Reputação atual</p>
                  <Badge 
                    variant={state.impact.deliverabilityScore >= 90 ? 'default' : state.impact.deliverabilityScore >= 80 ? 'secondary' : 'destructive'}
                    className="mt-1 text-xs"
                  >
                    {state.impact.deliverabilityScore >= 90 ? 'Excelente' : state.impact.deliverabilityScore >= 80 ? 'Bom' : 'Crítico'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Losses Avoided / Opportunities Realized Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Perdas Evitadas / Oportunidades Realizadas
                </CardTitle>
                <CardDescription>
                  Valor gerado pela plataforma através de otimizações e automações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">R$ 15.640</div>
                    <p className="text-sm text-muted-foreground mt-1">Receita adicional por Best Time</p>
                    <p className="text-xs text-success mt-1">+12.3% vs manual</p>
                  </div>
                  
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">R$ 8.920</div>
                    <p className="text-sm text-muted-foreground mt-1">Perdas evitadas por automações</p>
                    <p className="text-xs text-primary mt-1">23 violações prevenidas</p>
                  </div>
                  
                  <div className="text-center p-4 bg-warning/10 rounded-lg">
                    <div className="text-2xl font-bold text-warning">R$ 4.580</div>
                    <p className="text-sm text-muted-foreground mt-1">Economia em reputação preservada</p>
                    <p className="text-xs text-warning mt-1">15 complaints evitados</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">R$ 29.140</div>
                  <p className="text-muted-foreground">Valor total gerado este mês</p>
                  <Badge variant="outline" className="mt-2">ROI da plataforma: 340%</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protection" className="space-y-6">
            <DeliverabilityShield />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export function SmartPlannerPage() {
  return (
    <PlannerProvider>
      <SmartPlannerContent />
    </PlannerProvider>
  );
}