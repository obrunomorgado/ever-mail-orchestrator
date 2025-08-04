import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlanner, CampaignSegment, PlannedCampaign } from '@/contexts/PlannerContext';
import { Clock, TrendingUp, Users, Zap, Copy, Pause, Play, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface SmartDragDropProps {
  timeSlots: string[];
}

export function SmartDragDrop({ timeSlots }: SmartDragDropProps) {
  const { state, moveSegment, getOptimalTime } = usePlanner();
  const { availableSegments, plannedCampaigns } = state;
  const { toast } = useToast();
  const [draggedSegment, setDraggedSegment] = useState<string | null>(null);

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

    // Extract segment ID from draggable ID
    const segmentId = result.draggableId.split('-')[0];
    
    moveSegment(segmentId, sourceId, destId);
    
    // Show visual feedback with estimated impact
    const revenueChange = Math.random() * 500 - 250;
    toast({
      title: "Campanha Reagendada",
      description: `Impacto estimado: ${revenueChange > 0 ? '+' : ''}R$ ${revenueChange.toFixed(0)}`,
      variant: revenueChange > 0 ? "default" : "destructive"
    });
  };

  const getSegmentVariant = (segment: CampaignSegment | PlannedCampaign) => {
    if (segment.campaignType === 'breaking') return 'destructive';
    if (segment.campaignType === 'fechamento') return 'default';
    if (segment.campaignType === 'alerta') return 'secondary';
    return 'outline';
  };

  const handleQuickAction = (action: string, segmentId: string) => {
    switch (action) {
      case 'duplicate':
        toast({ title: "Duplicar", description: `Duplicando campanha ${segmentId}` });
        break;
      case 'pause':
        toast({ title: "Pausar", description: `Pausando campanha ${segmentId}` });
        break;
      case 'optimize':
        toast({ title: "Otimizar", description: `Otimizando horário para ${segmentId}` });
        break;
    }
  };

  const SegmentCard = ({ 
    segment, 
    index, 
    isDragging = false 
  }: { 
    segment: CampaignSegment | PlannedCampaign; 
    index: number; 
    isDragging?: boolean;
  }) => {
    const estimatedRevenue = 'estimatedRevenue' in segment 
      ? segment.estimatedRevenue 
      : segment.size * segment.ctr * segment.erpm;
    
    const optimalTime = getOptimalTime(segment.id, segment.campaignType, segment.vertical);
    const isOptimalTime = segment.timeSlot === `${optimalTime.hour.toString().padStart(2, '0')}:00`;
    
    return (
      <Draggable draggableId={segment.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 group ${snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl z-50' : ''} transition-all duration-200`}
          >
            <Card className={`
              hover:shadow-lg transition-all cursor-move relative overflow-hidden
              ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}
              ${draggedSegment === segment.id ? 'opacity-50' : ''}
            `}>
              {/* Best Time Indicator */}
              {isOptimalTime && (
                <div className="absolute top-0 right-0 bg-success text-success-foreground text-xs px-2 py-1 rounded-bl-md">
                  <Zap className="h-3 w-3 inline mr-1" />
                  Optimal
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{segment.name}</h4>
                    <div className="flex gap-1 mb-2">
                      <Badge variant={getSegmentVariant(segment)} className="text-xs">
                        {segment.campaignType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {segment.vertical}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        RFM: {segment.rfm}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Quick Actions Menu */}
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
                      <DropdownMenuItem onClick={() => handleQuickAction('duplicate', segment.id)}>
                        <Copy className="h-3 w-3 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleQuickAction('pause', segment.id)}>
                        <Pause className="h-3 w-3 mr-2" />
                        Pausar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleQuickAction('optimize', segment.id)}>
                        <Zap className="h-3 w-3 mr-2" />
                        Otimizar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contatos:</span>
                    <span className="font-medium">{segment.size.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTR:</span>
                    <span className="font-medium">{(segment.ctr * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">eRPM:</span>
                    <span className="font-medium">R$ {segment.erpm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Time:</span>
                    <span className="font-medium text-xs">
                      {optimalTime.hour.toString().padStart(2, '0')}:00h
                      <span className="text-success ml-1">
                        (+{optimalTime.lift}%)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Revenue Display */}
                <div className="mt-3 pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Receita Estimada:</span>
                    <span className="font-bold text-primary">
                      R$ {estimatedRevenue.toFixed(0)}
                    </span>
                  </div>
                  
                  {!isOptimalTime && optimalTime.confidence > 0.7 && (
                    <div className="text-xs text-warning mt-1">
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      +R$ {(estimatedRevenue * optimalTime.lift / 100).toFixed(0)} se movido para {optimalTime.hour.toString().padStart(2, '0')}:00h
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Available Segments */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Segmentos Disponíveis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {availableSegments.length} campanhas prontas para agendamento
            </p>
          </div>
          
          <div className="p-4">
            <Droppable droppableId="available">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[400px] ${
                    snapshot.isDraggingOver 
                      ? 'bg-muted/50 rounded-lg border-2 border-dashed border-primary' 
                      : ''
                  } transition-all duration-200`}
                >
                  {availableSegments.map((segment, index) => (
                    <SegmentCard key={segment.id} segment={segment} index={index} />
                  ))}
                  {provided.placeholder}
                  {availableSegments.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-12">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Nenhum segmento disponível
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </Card>

        {/* Time Slots */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {timeSlots.map((timeSlot) => (
            <Card key={timeSlot} className="flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{timeSlot}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plannedCampaigns[timeSlot]?.length || 0} campanha(s) agendada(s)
                </p>
                {plannedCampaigns[timeSlot]?.length > 0 && (
                  <div className="text-xs text-primary mt-1">
                    Receita: R$ {plannedCampaigns[timeSlot]
                      .reduce((sum, campaign) => sum + campaign.estimatedRevenue, 0)
                      .toFixed(0)}
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-1">
                <Droppable droppableId={timeSlot}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[300px] ${
                        snapshot.isDraggingOver 
                          ? 'bg-primary/10 rounded-lg border-2 border-dashed border-primary' 
                          : ''
                      } transition-all duration-200`}
                    >
                      {plannedCampaigns[timeSlot]?.map((campaign, index) => (
                        <SegmentCard key={campaign.id} segment={campaign} index={index} />
                      ))}
                      {provided.placeholder}
                      {(!plannedCampaigns[timeSlot] || plannedCampaigns[timeSlot].length === 0) && !snapshot.isDraggingOver && (
                        <div className="text-center text-muted-foreground text-sm py-12">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          Solte campanhas aqui
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}