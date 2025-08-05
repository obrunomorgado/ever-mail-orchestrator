import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { usePlanner, CampaignSegment, PlannedCampaign } from '@/contexts/PlannerContext';
import { SlotWizard } from './SlotWizard';
import { OverlapModal } from './OverlapModal';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  pointerWithin
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  Plus,
  Search,
  Users,
  Target,
  Clock,
  Trash2,
  Copy,
  Edit,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlannerGridViewProps {
  segments: CampaignSegment[];
  timeSlots: string[];
}

interface DraggedItem {
  id: string;
  type: 'segment' | 'campaign';
  data: CampaignSegment | PlannedCampaign;
}

// Draggable Segment Component
function DraggableSegment({ segment, index }: { segment: CampaignSegment; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="option"
      tabIndex={0}
      className={cn(
        "p-3 bg-card border rounded-lg cursor-grab active:cursor-grabbing transition-all",
        "hover:shadow-md hover:border-primary/50",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{segment.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {(segment.size / 1000).toFixed(0)}k
            </Badge>
            <span className="text-xs text-muted-foreground">
              CTR: {(segment.ctr * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Campaign Card Component
function CampaignCard({ 
  campaign, 
  date, 
  timeSlot,
  onEdit,
  onDelete,
  onCopy,
  showMenu = true 
}: { 
  campaign: PlannedCampaign; 
  date: string; 
  timeSlot: string;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  showMenu?: boolean;
}) {
  const { state } = usePlanner();
  const isMobile = useIsMobile();
  const [isEditing, setIsEditing] = useState(false);
  const { setSlotClickLimit } = usePlanner();

  // Calculate click limit status
  const estimatedClicks = Math.round(campaign.size * campaign.ctr);
  const clickLimit = campaign.clickLimit || 0;
  const limitProgress = clickLimit > 0 ? (estimatedClicks / clickLimit) * 100 : 0;
  
  const getLimitStatus = () => {
    if (clickLimit === 0) return { color: 'bg-muted', status: 'none' };
    if (limitProgress < 80) return { color: 'bg-success', status: 'good' };
    if (limitProgress < 100) return { color: 'bg-warning', status: 'warning' };
    return { color: 'bg-destructive', status: 'exceeded' };
  };

  const limitStatus = getLimitStatus();

  const handleClickLimitChange = (value: string) => {
    const newLimit = parseInt(value) || 0;
    setSlotClickLimit(date, timeSlot, campaign.id, newLimit);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClickLimitChange((e.target as HTMLInputElement).value);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className="relative group">
      {/* Click Limit Badge */}
      {clickLimit > 0 && (
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full z-10",
          limitStatus.color
        )} />
      )}
      
      <Card className="h-full transition-all hover:shadow-md">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm truncate flex-1">{campaign.name}</h4>
              {showMenu && (
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
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onCopy}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {(campaign.size / 1000).toFixed(0)}k
              </Badge>
              <span>CTR: {(campaign.ctr * 100).toFixed(1)}%</span>
            </div>
            
            {/* Click Limit Display/Edit */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Limite de Cliques:</span>
                {isEditing ? (
                  <Input
                    type="number"
                    defaultValue={clickLimit}
                    className="h-6 w-16 text-xs"
                    onBlur={(e) => handleClickLimitChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="hover:text-primary transition-colors"
                  >
                    {clickLimit || 'Definir'}
                  </button>
                )}
              </div>
              
              {clickLimit > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Estimado: {estimatedClicks}</span>
                    <span className={cn(
                      limitStatus.status === 'good' ? 'text-success' :
                      limitStatus.status === 'warning' ? 'text-warning' :
                      limitStatus.status === 'exceeded' ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {limitProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", limitStatus.color)}
                      style={{ width: `${Math.min(limitProgress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PlannerGridView({ segments, timeSlots }: PlannerGridViewProps) {
  const { state, createSlot, removeSlot, cloneSlot, undo, redo, canUndo, canRedo } = usePlanner();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // State management
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; timeSlot: string } | null>(null);
  const [showOverlapModal, setShowOverlapModal] = useState(false);
  const [overlapData, setOverlapData] = useState<any>(null);
  const [editingSlot, setEditingSlot] = useState<{ date: string; timeSlot: string; campaignId: string } | null>(null);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  
  // Clipboard for copy/paste
  const clipboardRef = useRef<PlannedCampaign | null>(null);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  // Filter segments
  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Navigation
  const goToPreviousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));
  const goToToday = () => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
        toast({ title: "Alteração desfeita", duration: 2000 });
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
        toast({ title: "Alteração refeita", duration: 2000 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, toast]);

  // Copy/Paste functions
  const copyConfiguration = (campaign: PlannedCampaign) => {
    clipboardRef.current = { ...campaign };
    toast({ title: "Configuração copiada", duration: 2000 });
  };

  const pasteConfiguration = (targetDate: string, targetHour: string) => {
    if (!clipboardRef.current) {
      toast({ title: "Nenhuma configuração copiada", variant: "destructive", duration: 2000 });
      return;
    }

    // Clone with new unique ID
    const newId = crypto.randomUUID();
    createSlot(targetDate, targetHour, clipboardRef.current.segmentId, clipboardRef.current.templateId);
    toast({ title: "Configuração colada", duration: 2000 });
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const segment = segments.find(s => s.id === active.id);
    
    if (segment) {
      setDraggedItem({ id: segment.id, type: 'segment', data: segment });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over) return;

    const overId = over.id as string;
    const [date, timeSlot] = overId.split('|');
    
    if (!date || !timeSlot) return;

    // Find the segment being dragged
    const segment = segments.find(s => s.id === active.id);
    if (!segment) return;

    // Check for existing campaign in slot
    const existingCampaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
    if (existingCampaigns.length > 0) {
      toast({
        title: "Slot já ocupado",
        description: "Este horário já possui uma campanha agendada.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    // Create new slot (template selection will be handled by the wizard)
    setSelectedSlot({ date, timeSlot });
    setShowWizard(true);
  };

  // Slot actions
  const handleCreateSlot = (date: string, timeSlot: string) => {
    setSelectedSlot({ date, timeSlot });
    setShowWizard(true);
  };

  const handleEditCampaign = (date: string, timeSlot: string, campaignId: string) => {
    setEditingSlot({ date, timeSlot, campaignId });
    setShowWizard(true);
  };

  const handleDeleteCampaign = (date: string, timeSlot: string, campaignId: string) => {
    removeSlot(date, timeSlot, campaignId);
    toast({ title: "Campanha removida", duration: 2000 });
  };

  const handleCopyCampaign = (campaign: PlannedCampaign) => {
    copyConfiguration(campaign);
  };

  const handleCloneCampaign = (date: string, timeSlot: string, campaignId: string) => {
    cloneSlot(date, timeSlot, campaignId);
    toast({ title: "Campanha clonada", duration: 2000 });
  };

  return (
    <div className="space-y-6" role="main" aria-label="Planejador de Campanhas">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Central de Planejamento
              </CardTitle>
              
              {/* Undo/Redo */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                  className="h-8 w-8 p-0"
                  title="Desfazer (Ctrl+Z)"
                >
                  ↶
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                  className="h-8 w-8 p-0"
                  title="Refazer (Ctrl+Shift+Z)"
                >
                  ↷
                </Button>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday} className="min-w-[100px]">
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar - Available Segments */}
        <div className="lg:col-span-1">
          <Card className="h-fit sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Segmentos Disponíveis</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar segmentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={filteredSegments.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 max-h-96 overflow-y-auto" role="listbox">
                    {filteredSegments.map((segment, index) => (
                      <DraggableSegment key={segment.id} segment={segment} index={index} />
                    ))}
                  </div>
                </SortableContext>
                
                <DragOverlay>
                  {draggedItem && draggedItem.type === 'segment' ? (
                    <DraggableSegment segment={draggedItem.data as CampaignSegment} index={0} />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {format(currentWeek, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Days Header */}
                    <div className="grid grid-cols-8 gap-2 mb-4">
                      <div className="p-2 text-center font-medium text-sm text-muted-foreground">
                        Horário
                      </div>
                      {weekDates.map(date => (
                        <div key={date.toISOString()} className="p-2 text-center">
                          <div className={cn(
                            "font-medium text-sm",
                            isToday(date) && "text-primary font-bold",
                            isTomorrow(date) && "text-blue-600"
                          )}>
                            {format(date, 'EEE', { locale: ptBR })}
                          </div>
                          <div className={cn(
                            "text-xs text-muted-foreground",
                            isToday(date) && "text-primary font-medium"
                          )}>
                            {format(date, 'dd/MM')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Time Slots Grid */}
                    <div className="space-y-2">
                      {timeSlots.map(timeSlot => (
                        <div key={timeSlot} className="grid grid-cols-8 gap-2">
                          {/* Time Label */}
                          <div className="p-2 text-center font-medium text-sm bg-muted/50 rounded flex items-center justify-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {timeSlot}
                          </div>

                          {/* Day Slots */}
                          {weekDates.map(date => {
                            const dateString = format(date, 'yyyy-MM-dd');
                            const campaigns = state.plannedCampaigns[dateString]?.[timeSlot] || [];
                            const droppableId = `${dateString}|${timeSlot}`;

                            return (
                              <div
                                key={droppableId}
                                data-droppable-id={droppableId}
                                className={cn(
                                  "min-h-[80px] p-1 border-2 border-dashed border-muted-foreground/20 rounded-lg",
                                  "transition-all hover:border-primary/50 hover:bg-primary/5",
                                  "flex flex-col gap-1"
                                )}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  // Handle drop
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                }}
                              >
                                {campaigns.length === 0 ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-full w-full border-0 justify-center items-center text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() => handleCreateSlot(dateString, timeSlot)}
                                  >
                                    <Plus className="h-4 w-4" />
                                    <span className="ml-1 text-xs">Criar</span>
                                  </Button>
                                ) : (
                                  campaigns.map(campaign => (
                                    <CampaignCard
                                      key={campaign.id}
                                      campaign={campaign}
                                      date={dateString}
                                      timeSlot={timeSlot}
                                      onEdit={() => handleEditCampaign(dateString, timeSlot, campaign.id)}
                                      onDelete={() => handleDeleteCampaign(dateString, timeSlot, campaign.id)}
                                      onCopy={() => handleCopyCampaign(campaign)}
                                    />
                                  ))
                                )}
                                
                                {/* Paste Area */}
                                {campaigns.length === 0 && clipboardRef.current && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs opacity-70 hover:opacity-100"
                                    onClick={() => pasteConfiguration(dateString, timeSlot)}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Colar
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DndContext>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Slot Wizard Modal */}
      <SlotWizard
        isOpen={showWizard}
        onOpenChange={setShowWizard}
        date={selectedSlot?.date}
        timeSlot={selectedSlot?.timeSlot}
        segments={segments}
        editingSlot={editingSlot}
      />

      {/* Overlap Modal */}
      {overlapData && (
        <OverlapModal
          open={showOverlapModal}
          onOpenChange={setShowOverlapModal}
          segmentAId={overlapData.segmentAId || ''}
          segmentBId={overlapData.segmentBId || ''}
        />
      )}
    </div>
  );
}