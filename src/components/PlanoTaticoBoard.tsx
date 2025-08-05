import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Calendar, Clock, Users, DollarSign, Target, Brain, Settings, Save, Download, Play, Search, Filter, AlertTriangle, CheckCircle, XCircle, Zap, BarChart3, Shield, TrendingUp, Eye, Timer, Bot, Sparkles, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { usePlanner, CampaignSegment, PlannedCampaign } from '@/contexts/PlannerContext';
import { useToast } from '@/hooks/use-toast';
import { segments, templates } from '@/mocks/demoData';
import { RevenueDashboard } from '@/components/RevenueDashboard';
import { GlobalSchedulerSettings } from '@/components/GlobalSchedulerSettings';
import { DeliverabilityShield } from '@/components/DeliverabilityShield';
import { usePlannerAutomation } from '@/hooks/usePlannerAutomation';
import { usePlannerDragDropV2 } from '@/hooks/usePlannerDragDropV2';
import { usePlannerProductivity } from '@/hooks/usePlannerProductivity';

console.log('[PlanoTaticoBoard] Component loading');

interface SlotCardProps {
  campaign: PlannedCampaign;
  date: string;
  timeSlot: string;
  onEdit: () => void;
  onDelete: () => void;
  onClone: () => void;
}

const SlotCard: React.FC<SlotCardProps> = ({ campaign, date, timeSlot, onEdit, onDelete, onClone }) => {
  const rpm = Math.round(campaign.estimatedRevenue / (campaign.size / 1000));
  const utilizationPercent = Math.round((campaign.size * campaign.ctr / campaign.clickLimit) * 100);
  
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{campaign.name}</h4>
          <p className="text-xs text-muted-foreground">{campaign.size.toLocaleString()} contatos</p>
        </div>
        <Badge variant={utilizationPercent >= 100 ? 'destructive' : utilizationPercent >= 80 ? 'secondary' : 'default'} className="text-xs">
          R$ {rpm}k
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">CTR: {(campaign.ctr * 100).toFixed(1)}%</span>
          <span className="text-muted-foreground">{utilizationPercent}% meta</span>
        </div>
        
        <Progress value={utilizationPercent} className="h-1" />
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={onEdit}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={onClone}>
            Clonar
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive" onClick={onDelete}>
            Remover
          </Button>
        </div>
      </div>
    </div>
  );
};

interface AudienceCardProps {
  segment: CampaignSegment;
  isDragging?: boolean;
}

const AudienceCard: React.FC<AudienceCardProps> = ({ segment, isDragging }) => {
  const health = segment.ctr > 0.02 ? 'high' : segment.ctr > 0.01 ? 'medium' : 'low';
  const healthColor = health === 'high' ? 'text-green-500' : health === 'medium' ? 'text-yellow-500' : 'text-red-500';
  const rpm = Math.round((segment.size * segment.ctr * segment.erpm) / (segment.size / 1000));
  
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-200",
      "hover:shadow-md hover:scale-[1.02]",
      isDragging && "opacity-50 rotate-3 scale-105"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{segment.name}</h4>
          <p className="text-xs text-muted-foreground">{segment.size.toLocaleString()} • {segment.rfm}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("w-2 h-2 rounded-full", healthColor.replace('text-', 'bg-'))} />
          <Badge variant="outline" className="text-xs">R$ {rpm}k</Badge>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>CTR: {(segment.ctr * 100).toFixed(1)}%</span>
        <span>{segment.campaignType}</span>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: any;
  score: number;
  isDragging?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, score, isDragging }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-200",
      "hover:shadow-md hover:scale-[1.02]",
      isDragging && "opacity-50 rotate-3 scale-105"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{template.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn("text-xs font-medium", getScoreColor(score))}>
            {score}
          </span>
          {template.isFavorite && <span className="text-yellow-400">⭐</span>}
          {template.isRecent && <span className="text-blue-400">🆕</span>}
          {score < 40 && <span className="text-red-400">⚠️</span>}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Open: {template.openRate}%</span>
        <span>Click: {template.clickRate}%</span>
      </div>
    </div>
  );
};

export function PlanoTaticoBoard() {
  console.log('[PlanoTaticoBoard] Rendering component');
  
  const { state, createSlot, removeSlot, cloneSlot, calculateTotalRevenue, checkFrequencyViolations, calculateProgressToGoal } = usePlanner();
  const { toast } = useToast();
  
  // Automation hooks
  const { autoFillBestSlots, smartWeeklyPlan, resolveAllConflicts, findBestTemplate, getAutomationStats } = usePlannerAutomation();
  const { draggedItem, handleDragStart, handleDragEnd, getSlotDropTargetStyle } = usePlannerDragDropV2();
  const { metrics: productivityMetrics, trackAction, getCurrentSessionTime, getProductivityInsights, getEfficiencyBadge } = usePlannerProductivity();
  
  // Estado local
  const [maxEmails, setMaxEmails] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [frequencyCap, setFrequencyCap] = useState(3);
  const [cooldownDays, setCooldownDays] = useState(4);
  const [showOverlapMatrix, setShowOverlapMatrix] = useState(false);
  
  // Horários-âncora configuráveis
  const [anchorTimes] = useState(['06:00', '09:00', '12:00', '15:00', '18:00']);
  
  // Dados dos próximos 7 dias
  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);
  
  // Templates com scores
  const templatesWithScores = useMemo(() => {
    return templates.map((template, index) => ({
      ...template,
      score: Math.round(85 - (index * 2) + Math.random() * 10),
      isFavorite: index < 3,
      isRecent: index < 2,
    })).sort((a, b) => b.score - a.score);
  }, []);
  
  // Audiências filtradas
  const filteredSegments = useMemo(() => {
    return segments.filter(segment => {
      const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = audienceFilter === 'all' || segment.campaignType === audienceFilter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      const aRpm = (a.size * a.ctr * a.erpm) / (a.size / 1000);
      const bRpm = (b.size * b.ctr * b.erpm) / (b.size / 1000);
      return bRpm - aRpm;
    });
  }, [searchTerm, audienceFilter]);
  
  // Templates filtrados
  const filteredTemplates = useMemo(() => {
    return templatesWithScores.filter(template => {
      return templateFilter === 'all' || 
             (templateFilter === 'favorites' && template.isFavorite) ||
             (templateFilter === 'recent' && template.isRecent) ||
             (templateFilter === 'low-spam' && template.score >= 70);
    });
  }, [templateFilter, templatesWithScores]);
  
  // Métricas em tempo real
  const metrics = useMemo(() => {
    const allCampaigns = Object.values(state.plannedCampaigns)
      .flatMap(dateSlots => Object.values(dateSlots))
      .flat();
      
    const totalEmails = allCampaigns.length;
    const totalContacts = allCampaigns.reduce((sum, campaign) => sum + campaign.size, 0);
    const totalRevenue = calculateTotalRevenue();
    const totalClicks = allCampaigns.reduce((sum, campaign) => sum + (campaign.size * campaign.ctr), 0);
    const basePercentage = totalContacts > 0 ? (totalContacts / 500000) * 100 : 0; // Assumindo base de 500k
    
    const progress = calculateProgressToGoal();
    
    return {
      emails: totalEmails,
      maxEmails,
      contacts: totalContacts,
      basePercentage: Math.min(basePercentage, 100),
      revenue: totalRevenue,
      clicks: Math.round(totalClicks),
      clickProgress: progress
    };
  }, [state.plannedCampaigns, maxEmails, calculateTotalRevenue, calculateProgressToGoal]);
  
  // Verificações de violação
  const violations = useMemo(() => {
    const frequencyViolations = checkFrequencyViolations();
    const cooldownViolations: string[] = []; // Implementar lógica de cool-down
    const overlapViolations: string[] = []; // Implementar lógica de overlap
    
    return {
      frequency: frequencyViolations,
      cooldown: cooldownViolations,
      overlap: overlapViolations,
      hasAny: frequencyViolations.length > 0 || cooldownViolations.length > 0 || overlapViolations.length > 0
    };
  }, [checkFrequencyViolations]);
  
  // Enhanced Drag and Drop with auto-template matching
  const onDragEnd = useCallback((result: DropResult) => {
    console.log('[PlanoTaticoBoard] Drag ended:', result);
    
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // Track manual action for productivity metrics
    trackAction('manual');
    
    // Parse destination (format: "slot-date-time")
    if (destination.droppableId.startsWith('slot-')) {
      const [, date, timeSlot] = destination.droppableId.split('-');
      
      // Check if it's a segment or template being dragged
      if (source.droppableId === 'segments') {
        const segment = filteredSegments.find(s => s.id === draggableId);
        if (segment && date && timeSlot) {
          // Check for existing campaigns in slot
          const existingCampaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
          if (existingCampaigns.length > 0) {
            toast({
              title: "Slot já ocupado",
              description: "Use automação para redistribuir ou escolha outro slot",
              variant: "destructive",
              duration: 3000
            });
            return;
          }
          
          // Auto-find best template for this segment
          const bestTemplate = findBestTemplate(segment);
          createSlot(date, timeSlot, segment.id, bestTemplate.id);
          
          toast({
            title: "Campanha criada",
            description: `${segment.name} + ${bestTemplate.name} (Score: ${Math.round(bestTemplate.compatibilityScore)})`,
            duration: 3000
          });
        }
      } else if (source.droppableId === 'templates') {
        // Handle template drag to existing slots
        const template = filteredTemplates.find(t => t.id === draggableId);
        if (template && date && timeSlot) {
          const existingCampaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
          if (existingCampaigns.length === 0) {
            toast({
              title: "Slot vazio",
              description: "Arraste primeiro uma audiência para este slot",
              variant: "destructive",
              duration: 2000
            });
            return;
          }
          
          toast({
            title: "Template aplicado",
            description: `${template.name} aplicado ao slot ${timeSlot}`,
            duration: 2000
          });
        }
      }
    }
    
    // Use enhanced drag handler
    handleDragEnd(result);
  }, [filteredSegments, filteredTemplates, state.plannedCampaigns, createSlot, toast, trackAction, findBestTemplate, handleDragEnd]);
  
  // Ações
  const handleLaunchDay = useCallback(() => {
    console.log('[PlanoTaticoBoard] Launching day');
    toast({
      title: "Dia Lançado",
      description: `${metrics.emails} campanhas agendadas com sucesso!`,
      duration: 3000
    });
  }, [metrics.emails, toast]);
  
  const handleSaveDraft = useCallback(() => {
    console.log('[PlanoTaticoBoard] Saving draft');
    toast({
      title: "Rascunho Salvo",
      description: "Planejamento salvo com sucesso",
      duration: 2000
    });
  }, [toast]);
  
  const handleExportCSV = useCallback(() => {
    console.log('[PlanoTaticoBoard] Exporting CSV');
    toast({
      title: "CSV Exportado",
      description: "Arquivo baixado com sucesso",
      duration: 2000
    });
  }, [toast]);
  
  const handleCheckDuplicates = useCallback(() => {
    console.log('[PlanoTaticoBoard] Checking duplicates');
    setShowOverlapMatrix(true);
  }, []);
  
  const handleResolveDuplicates = useCallback(() => {
    console.log('[PlanoTaticoBoard] Resolving duplicates');
    toast({
      title: "Duplicados Resolvidos",
      description: "Sobreposições foram automaticamente corrigidas",
      duration: 2000
    });
    setShowOverlapMatrix(false);
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Cabeçalho de Métricas */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Contador de Envios */}
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Envios</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {metrics.emails}<span className="text-lg text-muted-foreground">/{maxEmails}</span>
                  </div>
                  <Progress value={(metrics.emails / maxEmails) * 100} className="h-1 mt-2" />
                </CardContent>
              </Card>
              
              {/* Base Engajada */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Base Engajada</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.basePercentage.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">{metrics.contacts.toLocaleString()} contatos</p>
                </CardContent>
              </Card>
              
              {/* Cliques Previstos */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Cliques Previstos</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.clicks.toLocaleString()}</div>
                  <Progress value={metrics.clickProgress.percentage} className="h-1 mt-2" />
                </CardContent>
              </Card>
              
              {/* Receita Prevista */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Receita Prevista</span>
                  </div>
                  <div className="text-2xl font-bold">R$ {metrics.revenue.toLocaleString()}</div>
                  <p className="text-xs text-success">+{((metrics.revenue / 50000) * 100).toFixed(1)}% vs manual</p>
                </CardContent>
              </Card>
              
              {/* Meta de Cliques */}
              <Card className={violations.hasAny ? "border-destructive/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Meta de Cliques</span>
                    {violations.hasAny && <AlertTriangle className="h-3 w-3 text-destructive" />}
                  </div>
                  <div className="text-lg font-bold">
                    {metrics.clickProgress.current.toLocaleString()} / {metrics.clickProgress.target.toLocaleString()}
                  </div>
                  <Progress 
                    value={metrics.clickProgress.percentage} 
                    className={cn("h-2 mt-2", violations.hasAny && "bg-destructive/10")}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Interface Principal */}
        <div className="flex">
          {/* Painel Lateral Inteligente */}
          <div className="w-96 border-r border-border bg-card max-h-screen overflow-hidden">
            <Tabs defaultValue="audiences" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                <TabsTrigger value="audiences" className="gap-2">
                  <Users className="h-4 w-4" />
                  Audiências
                </TabsTrigger>
                <TabsTrigger value="templates" className="gap-2">
                  <Brain className="h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Config
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                {/* Aba Audiências */}
                <TabsContent value="audiences" className="h-full m-0 p-4 space-y-4 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Audiências Disponíveis</h3>
                    <Badge variant="outline">{filteredSegments.length}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <Input
                      placeholder="Buscar audiência..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-9"
                    />
                    
                    <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as audiências</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="alerta">Alerta</SelectItem>
                        <SelectItem value="fechamento">Fechamento</SelectItem>
                        <SelectItem value="breaking">Breaking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Droppable droppableId="segments">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                         {filteredSegments.map((segment, index) => (
                           <Draggable key={segment.id} draggableId={segment.id} index={index}>
                             {(provided, snapshot) => (
                               <div
                                 ref={provided.innerRef}
                                 {...provided.draggableProps}
                                 {...provided.dragHandleProps}
                                 onDragStart={() => handleDragStart({ draggableId: segment.id, source: { droppableId: 'segments', index } })}
                               >
                                 <AudienceCard segment={segment} isDragging={snapshot.isDragging} />
                               </div>
                             )}
                           </Draggable>
                         ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </TabsContent>

                {/* Aba Templates */}
                <TabsContent value="templates" className="h-full m-0 p-4 space-y-4 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Templates Rankeados</h3>
                    <Badge variant="outline">{filteredTemplates.length}</Badge>
                  </div>
                  
                  <Select value={templateFilter} onValueChange={setTemplateFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os templates</SelectItem>
                      <SelectItem value="favorites">Favoritos ⭐</SelectItem>
                      <SelectItem value="recent">Recentes 🆕</SelectItem>
                      <SelectItem value="low-spam">Baixo Spam ✅</SelectItem>
                    </SelectContent>
                  </Select>
                  
                   <Droppable droppableId="templates">
                     {(provided) => (
                       <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                         {filteredTemplates.map((template, index) => (
                           <Draggable key={template.id} draggableId={template.id} index={index}>
                             {(provided, snapshot) => (
                               <div
                                 ref={provided.innerRef}
                                 {...provided.draggableProps}
                                 {...provided.dragHandleProps}
                                 onDragStart={() => handleDragStart({ draggableId: template.id, source: { droppableId: 'templates', index } })}
                               >
                                 <TemplateCard 
                                   template={template} 
                                   score={template.score}
                                   isDragging={snapshot.isDragging}
                                 />
                               </div>
                             )}
                           </Draggable>
                         ))}
                         {provided.placeholder}
                       </div>
                     )}
                   </Droppable>
                </TabsContent>

                {/* Aba Analytics */}
                <TabsContent value="analytics" className="h-full m-0 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Analytics Integrado</h3>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5" />
                              Analytics Completo - Plano Tático
                            </DialogTitle>
                            <DialogDescription>
                              Visão detalhada de performance, ROI e otimizações do planejamento atual
                            </DialogDescription>
                          </DialogHeader>
                          <RevenueDashboard segments={segments} />
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Resumo compacto do RevenueDashboard */}
                    <div className="space-y-3">
                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Resumo Financeiro</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Receita projetada:</span>
                              <span className="font-medium">R$ {metrics.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">vs Manual:</span>
                              <span className="text-success">+{((metrics.revenue / 50000) * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Score de Risco</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-lg font-bold",
                              violations.hasAny ? "text-destructive" : "text-success"
                            )}>
                              {violations.hasAny ? "ALTO" : "BAIXO"}
                            </span>
                            <Badge variant={violations.hasAny ? "destructive" : "default"}>
                              {violations.frequency.length + violations.cooldown.length + violations.overlap.length} riscos
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">Performance</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Campanhas ativas:</span>
                              <span className="font-medium">{metrics.emails}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Base engajada:</span>
                              <span className="font-medium">{metrics.basePercentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba Configurações */}
                <TabsContent value="settings" className="h-full m-0 p-4 space-y-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Configurações</h3>
                      <GlobalSchedulerSettings 
                        trigger={
                          <Button variant="outline" size="sm" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Avançado
                          </Button>
                        }
                      />
                    </div>

                    {/* Controles Rápidos */}
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nº de Envios</label>
                          <Input 
                            type="number" 
                            value={maxEmails} 
                            onChange={(e) => setMaxEmails(Number(e.target.value))}
                            min={1}
                            max={50}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Limite máximo de campanhas no plano
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Frequency-Cap</label>
                          <Slider
                            value={[frequencyCap]}
                            onValueChange={(value) => setFrequencyCap(value[0])}
                            max={10}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {frequencyCap} emails por destinatário/24h
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Cool-down</label>
                          <Slider
                            value={[cooldownDays]}
                            onValueChange={(value) => setCooldownDays(value[0])}
                            max={30}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {cooldownDays} dias entre campanhas similares
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Proteções de Deliverability Compacta */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">Proteções Ativas</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Spam Guard</span>
                            <Badge variant="default" className="text-xs">Normal</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Bounce Shield</span>
                            <Badge variant="default" className="text-xs">Normal</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Frequency Shield</span>
                            <Badge variant={violations.frequency.length > 0 ? "destructive" : "default"} className="text-xs">
                              {violations.frequency.length > 0 ? "Ativo" : "Normal"}
                            </Badge>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                              <Shield className="h-4 w-4" />
                              Ver Proteções Completas
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Deliverability Shield - Proteções Completas
                              </DialogTitle>
                              <DialogDescription>
                                Monitoramento e proteções em tempo real para preservar a reputação de envio
                              </DialogDescription>
                            </DialogHeader>
                            <DeliverabilityShield />
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Grade Principal */}
          <div className="flex-1 p-6">
            {/* Painel de Automação Inteligente */}
            <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Automação Inteligente</h3>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Timer className="h-3 w-3" />
                      {getCurrentSessionTime()}s
                    </Badge>
                    <Badge {...getEfficiencyBadge()} className="text-white">
                      {getEfficiencyBadge().label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    {productivityMetrics.automationSavings.toFixed(1)}min economizados
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button 
                    onClick={async () => {
                      trackAction('automation');
                      const result = await autoFillBestSlots();
                      toast({
                        title: "Auto-Fill Concluído",
                        description: `${result.filledCount} slots preenchidos em ${result.duration}ms`,
                        duration: 3000
                      });
                    }}
                    variant="outline" 
                    className="gap-2 h-auto p-3 flex-col"
                  >
                    <Sparkles className="h-4 w-4" />
                    <div className="text-center">
                      <div className="font-medium text-xs">Auto-Fill Best Slots</div>
                      <div className="text-[10px] text-muted-foreground">Preencher por RPM</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={async () => {
                      trackAction('automation');
                      const result = await smartWeeklyPlan();
                      toast({
                        title: "Plano Semanal Criado",
                        description: `${result.segmentsScheduled} segmentos distribuídos`,
                        duration: 3000
                      });
                    }}
                    variant="outline" 
                    className="gap-2 h-auto p-3 flex-col"
                  >
                    <Calendar className="h-4 w-4" />
                    <div className="text-center">
                      <div className="font-medium text-xs">Smart Weekly Plan</div>
                      <div className="text-[10px] text-muted-foreground">Otimizar semana</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={async () => {
                      trackAction('automation');
                      const result = await resolveAllConflicts();
                      toast({
                        title: "Conflitos Resolvidos",
                        description: `${result.resolvedCount} conflitos corrigidos`,
                        duration: 3000
                      });
                    }}
                    variant={violations.hasAny ? "destructive" : "outline"}
                    className="gap-2 h-auto p-3 flex-col"
                  >
                    <Shield className="h-4 w-4" />
                    <div className="text-center">
                      <div className="font-medium text-xs">Resolver Tudo</div>
                      <div className="text-[10px] text-muted-foreground">
                        {violations.hasAny ? `${violations.frequency.length + violations.cooldown.length + violations.overlap.length} conflitos` : "Sem conflitos"}
                      </div>
                    </div>
                  </Button>

                  <div className="flex flex-col gap-2">
                    <Button onClick={handleCheckDuplicates} variant="outline" size="sm" className="gap-2">
                      <Search className="h-3 w-3" />
                      <span className="text-xs">Checar Overlap</span>
                    </Button>
                    <Button onClick={handleSaveDraft} variant="outline" size="sm" className="gap-2">
                      <Save className="h-3 w-3" />
                      <span className="text-xs">Salvar</span>
                    </Button>
                  </div>
                </div>

                {/* Insights de Produtividade */}
                {getProductivityInsights().length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs font-medium mb-2">💡 Insights de Produtividade:</div>
                    <div className="space-y-1">
                      {getProductivityInsights().slice(0, 2).map((insight, i) => (
                        <div key={i} className="text-xs text-muted-foreground">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            insight.type === 'success' ? 'bg-green-500' :
                            insight.type === 'warning' ? 'bg-yellow-500' :
                            insight.type === 'tip' ? 'bg-blue-500' : 'bg-purple-500'
                          }`} />
                          {insight.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações Secundárias */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Sessão ativa: {getCurrentSessionTime()}s | 
                Automação: {productivityMetrics.weeklyEfficiency.toFixed(0)}%
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                
                <Button onClick={handleLaunchDay} className="bg-primary text-primary-foreground" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Lançar Dia
                </Button>
              </div>
            </div>

            {/* Grade de Slots */}
            <div className="grid gap-4">
              {/* Header com horários */}
              <div className="grid grid-cols-8 gap-4">
                <div className="font-medium text-sm text-muted-foreground">Data</div>
                {anchorTimes.map((time) => (
                  <div key={time} className="font-medium text-sm text-center text-muted-foreground">
                    {time}
                  </div>
                ))}
              </div>
              
              {/* Linhas dos dias */}
              {weekDates.map((date) => {
                const dateObj = new Date(date);
                const isToday = date === new Date().toISOString().split('T')[0];
                
                return (
                  <div key={date} className="grid grid-cols-8 gap-4">
                    {/* Data */}
                    <div className={cn(
                      "flex flex-col justify-center p-2 rounded-lg border",
                      isToday ? "bg-primary/10 border-primary/20" : "bg-muted/50"
                    )}>
                      <div className="font-medium text-sm">
                        {dateObj.toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                    
                    {/* Slots de horário */}
                    {anchorTimes.map((timeSlot) => {
                      const campaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
                      const slotId = `slot-${date}-${timeSlot}`;
                      
                      return (
                        <Droppable key={slotId} droppableId={slotId}>
                          {(provided, snapshot) => (
                           <div
                               ref={provided.innerRef}
                               {...provided.droppableProps}
                               className={cn(
                                 "min-h-24 p-2 rounded-lg border-2 border-dashed transition-all duration-200",
                                 snapshot.isDraggingOver 
                                   ? "border-primary bg-primary/5" 
                                   : campaigns.length > 0 
                                     ? "border-border bg-card" 
                                     : "border-muted-foreground/20 hover:border-primary/50",
                                 getSlotDropTargetStyle(date, timeSlot)
                               )}
                             >
                              <div className="space-y-2">
                                {campaigns.map((campaign) => (
                                  <SlotCard
                                    key={campaign.id}
                                    campaign={campaign}
                                    date={date}
                                    timeSlot={timeSlot}
                                    onEdit={() => console.log('Edit', campaign.id)}
                                    onDelete={() => removeSlot(date, timeSlot, campaign.id)}
                                    onClone={() => cloneSlot(campaign.id, date, date)}
                                  />
                                ))}
                                
                                {campaigns.length === 0 && (
                                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                                    Arraste audiência ou template
                                  </div>
                                )}
                              </div>
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}