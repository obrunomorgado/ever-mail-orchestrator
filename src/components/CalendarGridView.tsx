import React, { useState, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  Zap,
  Users,
  Target,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePlanner, CampaignSegment, PlannedCampaign } from '@/contexts/PlannerContext';
import { useToast } from '@/hooks/use-toast';

interface CalendarGridViewProps {
  segments: CampaignSegment[];
  timeSlots: string[];
}

interface GridSlot {
  date: string;
  timeSlot: string;
  campaigns: PlannedCampaign[];
  clickLimit: number;
  totalClicks: number;
  revenue: number;
}

export function CalendarGridView({ segments, timeSlots }: CalendarGridViewProps) {
  const { 
    state, 
    moveSegment, 
    removeSlot,
    cloneSlot,
    getOptimalTime,
    checkFrequencyViolations,
    updateClickLimit
  } = usePlanner();
  
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editingClickLimit, setEditingClickLimit] = useState<{ date: string; timeSlot: string } | null>(null);
  const [draggedSegment, setDraggedSegment] = useState<string | null>(null);

  // Generate week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentWeek]);

  // Calculate grid data with click limits and violations
  const gridData = useMemo(() => {
    const data: GridSlot[][] = [];
    
    timeSlots.forEach(timeSlot => {
      const row: GridSlot[] = [];
      
      weekDays.forEach(day => {
        const dateString = format(day, 'yyyy-MM-dd');
        const campaigns = state.plannedCampaigns[dateString]?.[timeSlot] || [];
        
        // Calculate metrics for this slot
        const totalClicks = campaigns.reduce((sum, campaign) => 
          sum + (campaign.size * campaign.ctr), 0);
        const revenue = campaigns.reduce((sum, campaign) => 
          sum + campaign.estimatedRevenue, 0);
        
        // Default click limit based on historical data
        const defaultClickLimit = Math.max(5000, Math.round(totalClicks * 1.2));
        
        row.push({
          date: dateString,
          timeSlot,
          campaigns,
          clickLimit: defaultClickLimit, // TODO: Store in context
          totalClicks: Math.round(totalClicks),
          revenue
        });
      });
      
      data.push(row);
    });
    
    return data;
  }, [weekDays, timeSlots, state.plannedCampaigns]);

  // Navigation handlers
  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const newWeek = addDays(currentWeek, direction === 'next' ? 7 : -7);
    setCurrentWeek(newWeek);
  }, [currentWeek]);

  // Drag and drop handlers
  const onDragStart = (result: any) => {
    setDraggedSegment(result.draggableId);
  };

  const onDragEnd = (result: DropResult) => {
    setDraggedSegment(null);
    
    const { source, destination } = result;
    if (!destination) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;
    
    if (sourceId === destId) return;

    // Parse destination slot
    const [destDate, destTimeSlot] = destId.split('-');
    const segmentId = result.draggableId.split('-')[0];
    
    moveSegment(segmentId, sourceId, destId);
    
    // Show feedback with click limit validation
    const destSlot = gridData.flat().find(slot => 
      slot.date === destDate && slot.timeSlot === destTimeSlot);
    
    if (destSlot && destSlot.totalClicks > destSlot.clickLimit) {
      toast({
        title: "⚠️ Limite de Cliques Ultrapassado",
        description: `${destSlot.totalClicks.toLocaleString()} cliques excedem o limite de ${destSlot.clickLimit.toLocaleString()}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "✅ Campanha Reagendada",
        description: `Movida para ${format(new Date(destDate), 'dd/MM')} às ${destTimeSlot}`,
        variant: "default"
      });
    }
  };

  // Click limit editing
  const handleClickLimitEdit = (date: string, timeSlot: string, newLimit: number) => {
    // Update all campaigns in this slot with the new click limit
    const slot = gridData.flat().find(s => s.date === date && s.timeSlot === timeSlot);
    if (slot) {
      slot.campaigns.forEach(campaign => {
        updateClickLimit(date, timeSlot, campaign.id, newLimit);
      });
    }
    
    setEditingClickLimit(null);
    
    toast({
      title: "Limite Atualizado",
      description: `Novo limite: ${newLimit.toLocaleString()} cliques`,
      variant: "default"
    });
  };

  // Quick actions
  const handleQuickAction = (action: string, campaign: PlannedCampaign, date: string, timeSlot: string) => {
    switch (action) {
      case 'edit':
        toast({ title: "Editar", description: `Editando campanha ${campaign.name}` });
        break;
      case 'duplicate':
        cloneSlot(campaign.id, date, format(addDays(new Date(date), 1), 'yyyy-MM-dd'));
        toast({ title: "Duplicado", description: `Campanha duplicada para o próximo dia` });
        break;
      case 'remove':
        removeSlot(date, timeSlot, campaign.id);
        toast({ title: "Removido", description: `Campanha removida do slot` });
        break;
    }
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="space-y-4">
        {/* Header with Navigation */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Planner de Campanhas 2.0
              </CardTitle>
              
              {/* Week Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-sm font-medium min-w-[200px] text-center">
                  {format(weekDays[0], 'dd/MM', { locale: ptBR })} - {format(weekDays[6], 'dd/MM', { locale: ptBR })}
                </div>
                
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Available Segments Sidebar */}
        <div className="grid grid-cols-12 gap-4">
          <Card className="col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Segmentos Disponíveis ({state.availableSegments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="available">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 min-h-[300px] ${
                      snapshot.isDraggingOver ? 'bg-muted/50 rounded-lg p-2' : ''
                    }`}
                  >
                    {state.availableSegments.map((segment, index) => (
                      <Draggable key={segment.id} draggableId={segment.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${snapshot.isDragging ? 'rotate-1 scale-105' : ''} transition-all`}
                          >
                            <Card className="cursor-move hover:shadow-md transition-shadow">
                              <CardContent className="p-3">
                                <div className="space-y-2">
                                  <h4 className="text-xs font-medium">{segment.name}</h4>
                                  <div className="flex gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {segment.campaignType}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {segment.vertical}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {(segment.size / 1000).toFixed(0)}k contatos • CTR {(segment.ctr * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Calendar Grid */}
          <div className="col-span-9">
            <Card>
              <CardContent className="p-4">
                {/* Days Header */}
                <div className="grid grid-cols-8 gap-2 mb-4">
                  <div className="text-sm font-medium text-center">Horário</div>
                  {weekDays.map(day => (
                    <div key={day.toISOString()} className="text-center">
                      <div className="text-sm font-medium">
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(day, 'dd/MM')}
                      </div>
                      {isSameDay(day, new Date()) && (
                        <div className="text-xs text-primary font-medium">Hoje</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Time Slots Grid */}
                <div className="space-y-2">
                  {gridData.map((row, timeIndex) => (
                    <div key={timeSlots[timeIndex]} className="grid grid-cols-8 gap-2">
                      {/* Time Slot Label */}
                      <div className="flex items-center justify-center py-2 bg-muted rounded-md">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{timeSlots[timeIndex]}</span>
                      </div>

                      {/* Day Cells */}
                      {row.map((slot, dayIndex) => (
                        <Droppable key={`${slot.date}-${slot.timeSlot}`} droppableId={`${slot.date}-${slot.timeSlot}`}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`
                                min-h-[120px] p-2 border rounded-md transition-all
                                ${snapshot.isDraggingOver ? 'bg-primary/10 border-primary border-2' : 'border-border'}
                                ${slot.campaigns.length === 0 ? 'bg-muted/20' : 'bg-background'}
                                hover:bg-muted/30
                              `}
                            >
                              {/* Click Limit Header */}
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-xs text-muted-foreground">
                                  Limite: {editingClickLimit?.date === slot.date && editingClickLimit?.timeSlot === slot.timeSlot ? (
                                    <Input
                                      type="number"
                                      defaultValue={slot.clickLimit}
                                      className="w-16 h-5 text-xs p-1"
                                      onBlur={(e) => handleClickLimitEdit(slot.date, slot.timeSlot, parseInt(e.target.value))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleClickLimitEdit(slot.date, slot.timeSlot, parseInt(e.currentTarget.value));
                                        }
                                      }}
                                      autoFocus
                                    />
                                  ) : (
                                    <span 
                                      className="cursor-pointer hover:text-primary"
                                      onClick={() => setEditingClickLimit({ date: slot.date, timeSlot: slot.timeSlot })}
                                    >
                                      {slot.clickLimit.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Status Badge */}
                                {slot.totalClicks > slot.clickLimit ? (
                                  <Badge variant="destructive" className="text-xs">
                                    ⚠️ {((slot.totalClicks / slot.clickLimit - 1) * 100).toFixed(0)}%
                                  </Badge>
                                ) : slot.totalClicks > slot.clickLimit * 0.8 ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round((slot.totalClicks / slot.clickLimit) * 100)}%
                                  </Badge>
                                ) : null}
                              </div>

                              {/* Campaigns */}
                              <div className="space-y-1">
                                {slot.campaigns.map((campaign, index) => {
                                  const optimalTime = getOptimalTime(campaign.id, campaign.campaignType, campaign.vertical);
                                  const isOptimalTime = slot.timeSlot === `${optimalTime.hour.toString().padStart(2, '0')}:00`;
                                  
                                  return (
                                    <Draggable key={campaign.id} draggableId={campaign.id} index={index}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`group ${snapshot.isDragging ? 'rotate-1 scale-105' : ''} transition-all`}
                                        >
                                          <Card className={`
                                            cursor-move hover:shadow-md transition-all text-xs
                                            ${isOptimalTime ? 'border-success border-l-4' : ''}
                                            ${snapshot.isDragging ? 'shadow-xl' : ''}
                                          `}>
                                            <CardContent className="p-2">
                                              <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-xs truncate">{campaign.name}</h4>
                                                
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="sm" 
                                                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                                                    >
                                                      <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent>
                                                    <DropdownMenuItem 
                                                      onClick={() => handleQuickAction('edit', campaign, slot.date, slot.timeSlot)}
                                                    >
                                                      <Edit className="h-3 w-3 mr-2" />
                                                      Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                      onClick={() => handleQuickAction('duplicate', campaign, slot.date, slot.timeSlot)}
                                                    >
                                                      <Copy className="h-3 w-3 mr-2" />
                                                      Duplicar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                      onClick={() => handleQuickAction('remove', campaign, slot.date, slot.timeSlot)}
                                                      className="text-destructive"
                                                    >
                                                      <Trash2 className="h-3 w-3 mr-2" />
                                                      Remover
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </div>
                                              
                                              <div className="flex gap-1 mb-1">
                                                <Badge variant="outline" className="text-xs px-1 py-0">
                                                  {campaign.campaignType}
                                                </Badge>
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
                                              </div>
                                              
                                              <div className="text-xs text-muted-foreground">
                                                {(campaign.size / 1000).toFixed(0)}k • CTR {(campaign.ctr * 100).toFixed(1)}%
                                              </div>
                                              
                                              <div className="text-xs font-medium text-primary mt-1">
                                                R$ {campaign.estimatedRevenue.toFixed(0)}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                
                                {/* Add Campaign Button for Empty Slots */}
                                {slot.campaigns.length === 0 && (
                                  <div className="flex items-center justify-center h-full">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 text-xs opacity-50 hover:opacity-100"
                                      onClick={() => {
                                        toast({
                                          title: "Criar Slot",
                                          description: `Novo slot para ${format(new Date(slot.date), 'dd/MM')} às ${slot.timeSlot}`,
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Criar Slot
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              {/* Slot Summary */}
                              {slot.campaigns.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-border text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      {slot.totalClicks.toLocaleString()} cliques
                                    </span>
                                    <span className="font-medium text-primary">
                                      R$ {slot.revenue.toFixed(0)}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}