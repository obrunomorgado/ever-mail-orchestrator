import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, TrendingUp, Users, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlanner, CampaignSegment, PlannedCampaign } from '@/contexts/PlannerContext';
import { usePlannerDefaults } from '@/hooks/usePlannerDefaults';
import { useIsMobile } from '@/hooks/use-mobile';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addWeeks, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

console.log('[Planner] CalendarView component loading');

interface SlotCardProps {
  campaign: PlannedCampaign;
  index: number;
  timeSlot: string;
  violations?: Array<{ type: string; message: string; severity: 'high' | 'medium' | 'low' }>;
}

interface CalendarViewProps {
  segments: CampaignSegment[];
}

const SlotCard: React.FC<SlotCardProps> = ({ campaign, index, timeSlot, violations = [] }) => {
  const { getOptimalTime } = usePlanner();
  const optimalTime = getOptimalTime(campaign.id, campaign.campaignType, campaign.vertical);
  const isOptimalTime = timeSlot === `${optimalTime.hour.toString().padStart(2, '0')}:00`;
  
  const hasViolations = violations.length > 0;
  const highPriorityViolation = violations.find(v => v.severity === 'high');
  
  return (
    <Draggable draggableId={`${campaign.segmentId}-${timeSlot}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 group ${snapshot.isDragging ? 'rotate-1 scale-105' : ''} transition-all duration-200`}
        >
          <Card className={`
            text-xs cursor-move relative overflow-hidden
            ${snapshot.isDragging ? 'ring-2 ring-primary shadow-xl z-50' : ''}
            ${hasViolations ? 'border-destructive border-2' : ''}
            ${isOptimalTime ? 'border-success border-l-4' : ''}
            hover:shadow-md transition-all
          `}>
            {/* Status Indicators */}
            <div className="absolute top-1 right-1 flex gap-1">
              {isOptimalTime && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Zap className="h-3 w-3 text-success" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Horário ótimo (+{optimalTime.lift}%)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {highPriorityViolation && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{highPriorityViolation.message}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {!hasViolations && !isOptimalTime && (
                <CheckCircle className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            
            <CardContent className="p-3 pt-5">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-xs leading-tight">{campaign.name}</h4>
                </div>
                
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {campaign.campaignType}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    RFM: {campaign.rfm}
                  </Badge>
                </div>
                
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envios:</span>
                    <span className="font-medium">{(campaign.size / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTR:</span>
                    <span className="font-medium">{(campaign.ctr * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                {/* Revenue */}
                <div className="pt-1 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Receita:</span>
                    <span className="font-bold text-primary text-xs">
                      R$ {campaign.estimatedRevenue.toFixed(0)}
                    </span>
                  </div>
                  
                  {/* Opportunity indicator */}
                  {!isOptimalTime && optimalTime.confidence > 0.7 && (
                    <div className="text-xs text-warning mt-1 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +R$ {(campaign.estimatedRevenue * optimalTime.lift / 100).toFixed(0)} no horário ótimo
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export function CalendarView({ segments }: CalendarViewProps) {
  const { 
    state, 
    moveSegment, 
    setDailyClickGoal, 
    setViewType, 
    setCurrentPeriod, 
    calculateProgressToGoal 
  } = usePlanner();
  
  const { defaults, validateTimeSlot } = usePlannerDefaults();
  const isMobile = useIsMobile();
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showOverlapHeatmap, setShowOverlapHeatmap] = useState(false);
  const [localClickGoal, setLocalClickGoal] = useState(state.dailyClickGoal);

  console.log('[Planner] CalendarView rendering with view type:', state.viewType);

  // Progress calculation
  const progress = calculateProgressToGoal();
  
  // Week/Month navigation
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const current = state.currentPeriod;
    let newPeriod: Date;
    
    if (state.viewType === 'week') {
      newPeriod = direction === 'next' ? addWeeks(current, 1) : addWeeks(current, -1);
    } else {
      newPeriod = direction === 'next' ? addMonths(current, 1) : addMonths(current, -1);
    }
    
    setCurrentPeriod(newPeriod);
    console.log('[Planner] Navigated to period:', newPeriod);
  };

  // Generate time slots for the current period
  const timeSlots = useMemo(() => {
    if (state.viewType === 'week') {
      const weekStart = startOfWeek(state.currentPeriod, { weekStartsOn: 1 });
      const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      
      return days.flatMap(day => 
        state.anchorTimes.map(time => ({
          id: `${format(day, 'yyyy-MM-dd')}-${time}`,
          date: day,
          time,
          display: `${format(day, 'EEE dd/MM', { locale: ptBR })} ${time}`,
          dayDisplay: format(day, 'EEE', { locale: ptBR }),
          dateDisplay: format(day, 'dd/MM'),
          campaigns: state.plannedCampaigns[time] || []
        }))
      );
    } else {
      // Monthly view - simplified
      const monthStart = startOfMonth(state.currentPeriod);
      const monthEnd = endOfMonth(state.currentPeriod);
      const days = [];
      let currentDay = monthStart;
      
      while (currentDay <= monthEnd) {
        days.push(currentDay);
        currentDay = addDays(currentDay, 1);
      }
      
      return days.map(day => ({
        id: format(day, 'yyyy-MM-dd'),
        date: day,
        time: 'all-day',
        display: format(day, 'dd'),
        dayDisplay: format(day, 'EEE', { locale: ptBR }),
        dateDisplay: format(day, 'dd'),
        campaigns: Object.values(state.plannedCampaigns).flat()
      }));
    }
  }, [state.viewType, state.currentPeriod, state.anchorTimes, state.plannedCampaigns]);

  // Drag and drop handlers
  const onDragStart = (result: any) => {
    setDraggedItem(result.draggableId);
    console.log('[Planner] Drag started:', result.draggableId);
  };

  const onDragEnd = (result: DropResult) => {
    setDraggedItem(null);
    
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;
    
    if (sourceId === destId) return;

    // Extract segment ID from draggable ID
    const segmentId = result.draggableId.split('-')[0];
    
    console.log('[Planner] Moving segment:', { segmentId, from: sourceId, to: destId });
    moveSegment(segmentId, sourceId, destId);
  };

  // Handle click goal change
  const handleClickGoalChange = (value: string) => {
    const goal = parseInt(value) || 0;
    setLocalClickGoal(goal);
  };

  const handleClickGoalSubmit = () => {
    setDailyClickGoal(localClickGoal);
  };

  // Render performance in sub-200ms
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log('[Planner] Calendar render time:', `${(endTime - startTime).toFixed(2)}ms`);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Planner 3.0 - Calendário Inteligente</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {state.viewType === 'week' ? 'Visão Semanal' : 'Visão Mensal'} • 
                    {format(state.currentPeriod, state.viewType === 'week' ? 'dd/MM' : 'MMMM yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <Select value={state.viewType} onValueChange={(value: 'week' | 'month') => setViewType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Overlap Toggle */}
              <Button 
                variant={showOverlapHeatmap ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowOverlapHeatmap(!showOverlapHeatmap)}
              >
                Sobreposição
              </Button>
            </div>
          </div>
          
          {/* Click Goal and Progress */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Label htmlFor="click-goal" className="text-sm font-medium">Meta de Cliques:</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="click-goal"
                  type="number"
                  value={localClickGoal}
                  onChange={(e) => handleClickGoalChange(e.target.value)}
                  className="w-24 h-8"
                />
                <Button size="sm" onClick={handleClickGoalSubmit}>
                  Aplicar
                </Button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Progresso do Dia</span>
                <span className="text-sm text-muted-foreground">
                  {progress.current.toLocaleString()} / {progress.target.toLocaleString()} cliques
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.percentage}% da meta atingida
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Available Segments Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Segmentos Disponíveis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {segments.length} campanhas prontas
              </p>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="available">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-2 ${
                      snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg border-2 border-dashed border-primary' : ''
                    }`}
                  >
                    {segments.map((segment, index) => (
                      <SlotCard
                        key={segment.id}
                        campaign={{
                          ...segment,
                          id: segment.id,
                          segmentId: segment.id,
                          estimatedRevenue: segment.size * segment.ctr * segment.erpm
                        }}
                        index={index}
                        timeSlot="available"
                      />
                    ))}
                    {provided.placeholder}
                    {segments.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Nenhum segmento disponível
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Calendar Main Area */}
          <div className="lg:col-span-3">
            {state.viewType === 'week' ? (
              /* Weekly View */
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-3">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const weekStart = startOfWeek(state.currentPeriod, { weekStartsOn: 1 });
                  const currentDay = addDays(weekStart, dayIndex);
                  
                  return (
                    <div key={dayIndex} className="space-y-3">
                      {/* Day Header */}
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="font-medium text-sm">
                          {format(currentDay, 'EEE', { locale: ptBR })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(currentDay, 'dd/MM')}
                        </div>
                      </div>
                      
                      {/* Time Slots for this day */}
                      {state.anchorTimes.map(timeSlot => {
                        const campaigns = state.plannedCampaigns[timeSlot] || [];
                        const violations = validateTimeSlot(timeSlot, campaigns.length);
                        
                        return (
                          <Card key={timeSlot} className="min-h-[120px]">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-primary" />
                                  <span className="text-xs font-medium">{timeSlot}</span>
                                </div>
                                {campaigns.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {campaigns.length}
                                  </Badge>
                                )}
                              </div>
                              {campaigns.length > 0 && (
                                <div className="text-xs text-primary">
                                  R$ {campaigns.reduce((sum, c) => sum + c.estimatedRevenue, 0).toFixed(0)}
                                </div>
                              )}
                            </CardHeader>
                            <CardContent className="pt-0">
                              <Droppable droppableId={timeSlot}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`min-h-[60px] ${
                                      snapshot.isDraggingOver 
                                        ? 'bg-primary/10 rounded-lg border-2 border-dashed border-primary' 
                                        : ''
                                    }`}
                                  >
                                    {campaigns.map((campaign, index) => (
                                      <SlotCard
                                        key={campaign.id}
                                        campaign={campaign}
                                        index={index}
                                        timeSlot={timeSlot}
                                        violations={violations}
                                      />
                                    ))}
                                    {provided.placeholder}
                                    {campaigns.length === 0 && !snapshot.isDraggingOver && (
                                      <div className="text-center text-muted-foreground text-xs py-4">
                                        <Clock className="h-4 w-4 mx-auto mb-1 opacity-50" />
                                        Arraste campanhas aqui
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Droppable>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Monthly View */
              <div className="grid grid-cols-7 gap-2">
                {/* Days of week header */}
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {timeSlots.map(slot => (
                  <Card key={slot.id} className="min-h-[100px] p-2">
                    <div className="text-sm font-medium mb-1">{slot.display}</div>
                    <div className="space-y-1">
                      {state.anchorTimes.map(time => {
                        const campaigns = state.plannedCampaigns[time] || [];
                        const dayTotal = campaigns.length;
                        
                        if (dayTotal === 0) return null;
                        
                        return (
                          <div key={time} className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-xs">{time}: {dayTotal}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DragDropContext>

      {/* Footer Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Última atualização: {format(new Date(), 'HH:mm:ss')}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Salvar Rascunho
              </Button>
              <Button variant="outline" size="sm">
                Exportar CSV
              </Button>
              <Button size="sm">
                Lançar Campanhas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}