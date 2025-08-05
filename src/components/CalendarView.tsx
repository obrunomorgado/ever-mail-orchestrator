import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, TrendingUp, Users, Zap, AlertTriangle, CheckCircle, Menu, Settings, Plus, MoreHorizontal, Copy, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { usePlanner, CampaignSegment, PlannedCampaign } from '@/contexts/PlannerContext';
import { usePlannerDefaults } from '@/hooks/usePlannerDefaults';
import { useIsMobile } from '@/hooks/use-mobile';
import { SlotWizard } from './SlotWizard';
import { GlobalSchedulerSettings } from './GlobalSchedulerSettings';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addWeeks, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

console.log('[Planner/CalendarView] Component loading');

// Constants for better performance
const DAYS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const COOL_DOWN_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 1);

interface SlotCardProps {
  campaign: PlannedCampaign;
  date: string;
  timeSlot: string;
  violations?: Array<{ type: string; message: string; severity: 'high' | 'medium' | 'low' }>;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

interface CalendarViewProps {
  segments: CampaignSegment[];
}

// Memoized SlotCard for performance
const SlotCard = React.memo<SlotCardProps>(({ campaign, date, timeSlot, violations = [], onEdit, onDuplicate, onRemove }) => {
  const { getOptimalTime } = usePlanner();
  console.log('[Planner/CalendarView] Rendering SlotCard for:', campaign.name);
  
  const optimalTime = getOptimalTime(campaign.id, campaign.campaignType, campaign.vertical);
  const isOptimalTime = timeSlot === `${optimalTime.hour.toString().padStart(2, '0')}:00`;
  
  const hasViolations = violations.length > 0;
  const highPriorityViolation = violations.find(v => v.severity === 'high');
  const mediumPriorityViolation = violations.find(v => v.severity === 'medium');
  const lowPriorityViolation = violations.find(v => v.severity === 'low');
  
  // Violation styling based on severity
  const getViolationStyling = () => {
    if (highPriorityViolation) return 'border-destructive border-2';
    if (mediumPriorityViolation) return 'border-warning border-2';
    if (lowPriorityViolation) return 'border-muted-foreground border-2';
    return '';
  };
  
  return (
    <div className="mb-2 group transition-all duration-200">
      <Card className={`
        text-xs relative overflow-hidden
        ${getViolationStyling()}
        ${isOptimalTime ? 'border-success border-l-4' : ''}
        hover:shadow-md transition-all
      `}>
        {/* Status Indicators and Actions */}
        <div className="absolute top-1 right-1 flex gap-1 items-center">
          {/* Status Icons */}
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
                  <p className="text-destructive font-medium">CRÍTICO: {highPriorityViolation.message}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!highPriorityViolation && mediumPriorityViolation && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-3 w-3 text-warning" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-warning font-medium">ATENÇÃO: {mediumPriorityViolation.message}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!highPriorityViolation && !mediumPriorityViolation && lowPriorityViolation && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-muted-foreground">INFO: {lowPriorityViolation.message}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!hasViolations && !isOptimalTime && (
            <CheckCircle className="h-3 w-3 text-muted-foreground" />
          )}

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar ▸
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remover Slot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardContent className="p-3 pt-5">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-xs leading-tight pr-8">{campaign.name}</h4>
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
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.campaign.id === nextProps.campaign.id &&
    prevProps.timeSlot === nextProps.timeSlot &&
    prevProps.violations?.length === nextProps.violations?.length
  );
});

export function CalendarView({ segments }: CalendarViewProps) {
  const { 
    state, 
    setDailyClickGoal, 
    setCoolDown,
    setViewType, 
    setCurrentPeriod, 
    calculateProgressToGoal,
    removeSlot,
    cloneSlot,
    duplicateDay
  } = usePlanner();
  
  const { defaults, validateTimeSlot, isLoading: defaultsLoading } = usePlannerDefaults();
  const isMobile = useIsMobile();
  
  const [localClickGoal, setLocalClickGoal] = useState(state.dailyClickGoal);
  const [localFrequencyCap, setLocalFrequencyCap] = useState(state.frequencyCap);
  const [localCoolDown, setLocalCoolDown] = useState(state.coolDown);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; timeSlot: string } | null>(null);
  const [editingSlot, setEditingSlot] = useState<{ date: string; timeSlot: string; campaignId: string } | null>(null);

  console.log('[Planner/CalendarView] Rendering with view type:', state.viewType);

  // Apply defaults on mount - CRITICAL FIX
  useEffect(() => {
    if (!defaultsLoading && defaults) {
      console.log('[Planner/CalendarView] Applying calculated defaults:', defaults);
      setDailyClickGoal(defaults.dailyClickGoal);
      setCoolDown(defaults.coolDown);
      setLocalClickGoal(defaults.dailyClickGoal);
      setLocalCoolDown(defaults.coolDown);
    }
  }, [defaultsLoading, defaults, setDailyClickGoal, setCoolDown]);

  // Memoized progress calculation for performance
  const progress = useMemo(() => calculateProgressToGoal(), [calculateProgressToGoal]);
  
  // Memoized timeSlots calculation to avoid re-renders
  const timeSlots = useMemo(() => {
    console.log('[Planner/CalendarView] Recalculating timeSlots');
    
    if (state.viewType === 'week') {
      const weekStart = startOfWeek(state.currentPeriod, { weekStartsOn: 1 });
      const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      
      return days.flatMap(day => {
        const dateString = format(day, 'yyyy-MM-dd');
        return state.anchorTimes.map(time => ({
          id: `${dateString}-${time}`,
          date: day,
          dateString,
          time,
          display: `${format(day, 'EEE dd/MM', { locale: ptBR })} ${time}`,
          dayDisplay: format(day, 'EEE', { locale: ptBR }),
          dateDisplay: format(day, 'dd/MM'),
          campaigns: state.plannedCampaigns[dateString]?.[time] || []
        }));
      });
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
      
      return days.map(day => {
        const dateString = format(day, 'yyyy-MM-dd');
        const allCampaigns = state.plannedCampaigns[dateString] 
          ? Object.values(state.plannedCampaigns[dateString]).flat()
          : [];
          
        return {
          id: dateString,
          date: day,
          dateString,
          time: 'all-day',
          display: format(day, 'dd'),
          dayDisplay: format(day, 'EEE', { locale: ptBR }),
          dateDisplay: format(day, 'dd'),
          campaigns: allCampaigns
        };
      });
    }
  }, [state.viewType, state.currentPeriod, state.anchorTimes, state.plannedCampaigns]);

  // Week/Month navigation
  const navigatePeriod = useCallback((direction: 'prev' | 'next') => {
    const current = state.currentPeriod;
    let newPeriod: Date;
    
    if (state.viewType === 'week') {
      newPeriod = direction === 'next' ? addWeeks(current, 1) : addWeeks(current, -1);
    } else {
      newPeriod = direction === 'next' ? addMonths(current, 1) : addMonths(current, -1);
    }
    
    setCurrentPeriod(newPeriod);
    console.log('[Planner/CalendarView] Navigated to period:', newPeriod);
  }, [state.viewType, state.currentPeriod, setCurrentPeriod]);

  // Handle click goal change with useCallback
  const handleClickGoalChange = useCallback((value: string) => {
    const goal = parseInt(value) || 0;
    setLocalClickGoal(goal);
  }, []);

  const handleClickGoalSubmit = useCallback(() => {
    setDailyClickGoal(localClickGoal);
    console.log('[Planner/CalendarView] Click goal updated to:', localClickGoal);
  }, [localClickGoal, setDailyClickGoal]);

  // Handle cool-down change
  const handleCoolDownChange = useCallback((days: number) => {
    setLocalCoolDown(days);
    setCoolDown(days);
    console.log('[Planner/CalendarView] Cool-down updated to:', days);
  }, [setCoolDown]);

  // Slot actions
  const handleSlotClick = useCallback((date: string, timeSlot: string) => {
    setSelectedSlot({ date, timeSlot });
    setWizardOpen(true);
  }, []);

  const handleSlotEdit = useCallback((campaign: PlannedCampaign, date: string, timeSlot: string) => {
    console.log('[CalendarView] Edit slot:', campaign.id, date, timeSlot);
    setEditingSlot({ date, timeSlot, campaignId: campaign.id });
    setWizardOpen(true);
  }, []);

  const handleSlotDuplicate = useCallback((campaign: PlannedCampaign, date: string, timeSlot: string) => {
    const currentDate = new Date(date);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateString = format(nextDate, 'yyyy-MM-dd');
    
    cloneSlot(campaign.id, date, nextDateString);
  }, [cloneSlot]);

  const handleSlotRemove = useCallback((campaign: PlannedCampaign, date: string, timeSlot: string) => {
    removeSlot(date, timeSlot, campaign.id);
  }, [removeSlot]);

  // Copy functionality removed for now - can be implemented later

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onAddCampaign: () => {
      setSelectedSlot({ date: format(new Date(), 'yyyy-MM-dd'), timeSlot: state.anchorTimes[0] });
      setWizardOpen(true);
    },
    onDuplicateSelected: () => {
      // TODO: Implement duplicate selected functionality
      console.log('[CalendarView] Duplicate selected triggered');
    },
    onRemoveSelected: () => {
      // TODO: Implement remove selected functionality
      console.log('[CalendarView] Remove selected triggered');
    }
  });

  // Render performance tracking
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      console.log('[Planner/CalendarView] Render time:', `${renderTime.toFixed(2)}ms`);
      
      if (renderTime > 200) {
        console.warn('[Planner/CalendarView] Slow render detected! Consider virtualization for', segments.length, 'segments');
      }
    };
  });

  // Settings sheet content
  const SettingsSheet = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Configurações</span>}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configurações do Planner</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 pt-6">
          {/* Frequency Cap */}
          <div className="space-y-2">
            <Label htmlFor="frequency-cap">Frequency Cap: {localFrequencyCap} emails/24h</Label>
            <Slider
              id="frequency-cap"
              min={1}
              max={6}
              step={1}
              value={[localFrequencyCap]}
              onValueChange={(value) => setLocalFrequencyCap(value[0])}
              className="w-full"
            />
          </div>
          
          {/* Cool-down */}
          <div className="space-y-2">
            <Label htmlFor="cool-down">Cool-down: {localCoolDown} dias</Label>
            <Select value={localCoolDown.toString()} onValueChange={(value) => handleCoolDownChange(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COOL_DOWN_OPTIONS.map(days => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} {days === 1 ? 'dia' : 'dias'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Defaults info */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Valores Calculados:</h4>
            <div className="text-xs space-y-1">
              <p>Meta diária: {defaults?.dailyClickGoal?.toLocaleString()} cliques</p>
              <p>Horários-âncora: {defaults?.anchorTimes?.join(', ')}</p>
              <p>Janela histórica: {defaults?.historyWindow} dias</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

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
              {/* Mobile sidebar trigger */}
              {isMobile && (
                <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              
              {/* Settings */}
              <SettingsSheet />
              
              {/* View Toggle */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={state.viewType === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('week')}
                  className="h-8"
                >
                  Semana
                </Button>
                <Button
                  variant={state.viewType === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('month')}
                  className="h-8"
                >
                  Mês
                </Button>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Calendário de Campanhas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Clique nas células para adicionar campanhas
              </p>
            </div>
            
            {/* Progress to Goal */}
            <div className="text-right space-y-2">
              <div className="text-sm font-medium">
                Meta Diária: {progress.current.toLocaleString()} / {progress.target.toLocaleString()} cliques
              </div>
              <Progress value={progress.percentage} className="w-48" />
              <div className="text-xs text-muted-foreground">
                {progress.percentage}% da meta alcançada
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar */}
          <div className="space-y-4">
            {state.viewType === 'week' ? (
              // Week View
              <div className="grid grid-cols-8 gap-2">
                {/* Header Row */}
                <div className="font-medium text-sm p-2">Horário</div>
                {Array.from({ length: 7 }, (_, i) => {
                  const day = addDays(startOfWeek(state.currentPeriod, { weekStartsOn: 1 }), i);
                  return (
                    <div key={i} className="font-medium text-sm p-2 text-center">
                      <div>{DAYS_PT[i]}</div>
                      <div className="text-xs text-muted-foreground">{format(day, 'dd/MM')}</div>
                    </div>
                  );
                })}
                
                {/* Time Slots */}
                {state.anchorTimes.map(time => (
                  <React.Fragment key={time}>
                    <div className="font-medium text-sm p-2 border-r border-border">
                      {time}
                    </div>
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const day = addDays(startOfWeek(state.currentPeriod, { weekStartsOn: 1 }), dayIndex);
                      const dateString = format(day, 'yyyy-MM-dd');
                      const campaigns = state.plannedCampaigns[dateString]?.[time] || [];
                      
                      return (
                        <div
                          key={`${dateString}-${time}`}
                          className="min-h-24 p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleSlotClick(dateString, time)}
                        >
                          {campaigns.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Plus className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {campaigns.map((campaign) => (
                                <SlotCard
                                  key={campaign.id}
                                  campaign={campaign}
                                  date={dateString}
                                  timeSlot={time}
                                  onEdit={() => handleSlotEdit(campaign, dateString, time)}
                                  onDuplicate={() => handleSlotDuplicate(campaign, dateString, time)}
                                  onRemove={() => handleSlotRemove(campaign, dateString, time)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              // Month View
              <div className="grid grid-cols-7 gap-2">
                {/* Headers */}
                {DAYS_PT.map(day => (
                  <div key={day} className="font-medium text-sm p-2 text-center border-b border-border">
                    {day}
                  </div>
                ))}
                
                {/* Days */}
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="min-h-24 p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleSlotClick(slot.dateString, '09:00')} // Default to 9AM for month view
                  >
                    <div className="text-sm font-medium mb-1">{slot.dateDisplay}</div>
                    {slot.campaigns.length === 0 ? (
                      <div className="flex items-center justify-center h-8 text-muted-foreground">
                        <Plus className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {slot.campaigns.length} campanha{slot.campaigns.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs font-medium text-primary">
                          R$ {slot.campaigns.reduce((sum, c) => sum + c.estimatedRevenue, 0).toFixed(0)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Slot Wizard Modal */}
      <SlotWizard
        isOpen={wizardOpen}
        onOpenChange={setWizardOpen}
        date={selectedSlot?.date || ''}
        timeSlot={selectedSlot?.timeSlot || '09:00'}
        segments={segments}
      />
    </div>
  );
}