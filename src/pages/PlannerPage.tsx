import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { segments } from "@/mocks/demoData";
import { Calendar, TrendingUp, Users } from "lucide-react";

interface SegmentData {
  id: string;
  name: string;
  auto: boolean;
  size: number;
  ctr: number;
  erpm: number;
  rfm: string;
  description: string;
  tags: string[];
  lastUpdate: string;
  timeSlot: string;
}

interface PlannedSegment {
  id: string;
  segmentId: string;
  name: string;
  size: number;
  ctr: number;
  erpm: number;
  timeSlot: string;
}

const timeSlots = ['07:00', '09:00', '12:00'];

export function PlannerPage() {
  const [availableSegments, setAvailableSegments] = useState<SegmentData[]>(
    segments.slice(0, 3).map(seg => ({ ...seg, timeSlot: 'available' }))
  );
  const [plannedSegments, setPlannedSegments] = useState<Record<string, PlannedSegment[]>>({
    '07:00': [],
    '09:00': [],
    '12:00': []
  });

  const calculateTotalRevenue = useCallback(() => {
    const total = Object.values(plannedSegments)
      .flat()
      .reduce((sum, segment) => sum + (segment.size * segment.ctr * segment.erpm), 0);
    return total;
  }, [plannedSegments]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;
    
    const sourceId = source.droppableId;
    const destId = destination.droppableId;
    
    if (sourceId === 'available' && timeSlots.includes(destId)) {
      // Moving from available to time slot
      const segment = availableSegments[source.index];
      const plannedSegment: PlannedSegment = {
        ...segment,
        id: `${segment.id}-${destId}`,
        segmentId: segment.id,
        timeSlot: destId
      };
      
      setAvailableSegments(prev => prev.filter((_, index) => index !== source.index));
      setPlannedSegments(prev => ({
        ...prev,
        [destId]: [...prev[destId], plannedSegment]
      }));
    } else if (timeSlots.includes(sourceId) && destId === 'available') {
      // Moving back to available
      const segment = plannedSegments[sourceId][source.index];
      const originalSegment = {
        ...segment,
        id: segment.segmentId,
        timeSlot: 'available'
      };
      
      setPlannedSegments(prev => ({
        ...prev,
        [sourceId]: prev[sourceId].filter((_, index) => index !== source.index)
      }));
      const fullSegment = segments.find(s => s.id === segment.segmentId);
      if (fullSegment) {
        setAvailableSegments(prev => [...prev, { ...fullSegment, timeSlot: 'available' }]);
      }
    } else if (timeSlots.includes(sourceId) && timeSlots.includes(destId) && sourceId !== destId) {
      // Moving between time slots
      const segment = plannedSegments[sourceId][source.index];
      const updatedSegment = { ...segment, timeSlot: destId, id: `${segment.segmentId}-${destId}` };
      
      setPlannedSegments(prev => ({
        ...prev,
        [sourceId]: prev[sourceId].filter((_, index) => index !== source.index),
        [destId]: [...prev[destId], updatedSegment]
      }));
    }
  };

  const SegmentCard = ({ segment, index, isDragging }: { segment: any, index: number, isDragging?: boolean }) => (
    <Draggable draggableId={segment.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 ${snapshot.isDragging ? 'opacity-80' : ''}`}
        >
          <Card className="hover:shadow-md transition-shadow cursor-move">
            <CardContent className="p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{segment.name}</h4>
                <Badge variant="outline" className="text-xs">
                  RFM: {segment.rfm}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Contatos:</span>
                  <span>{segment.size.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CTR:</span>
                  <span>{(segment.ctr * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>eRPM:</span>
                  <span>R$ {segment.erpm.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-primary">
                  <span>Receita Est.:</span>
                  <span>R$ {(segment.size * segment.ctr * segment.erpm).toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Planner de Campanhas</h1>
            <p className="text-muted-foreground">
              Arraste e solte segmentos nos horários desejados
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            R$ {calculateTotalRevenue().toFixed(0)}
          </div>
          <p className="text-sm text-muted-foreground">Receita Estimada Total</p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-6">
          {/* Available Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Segmentos Disponíveis
              </CardTitle>
              <CardDescription>
                {availableSegments.length} segmentos prontos para agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="available">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[300px] ${snapshot.isDraggingOver ? 'bg-muted/50 rounded' : ''}`}
                  >
                    {availableSegments.map((segment, index) => (
                      <SegmentCard key={segment.id} segment={segment} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Time Slots */}
          {timeSlots.map((timeSlot) => (
            <Card key={timeSlot}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {timeSlot}
                </CardTitle>
                <CardDescription>
                  {plannedSegments[timeSlot].length} segmento(s) agendado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={timeSlot}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[300px] ${snapshot.isDraggingOver ? 'bg-primary/10 rounded border-2 border-primary border-dashed' : ''}`}
                    >
                      {plannedSegments[timeSlot].map((segment, index) => (
                        <SegmentCard key={segment.id} segment={segment} index={index} />
                      ))}
                      {provided.placeholder}
                      {plannedSegments[timeSlot].length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          Solte segmentos aqui
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Object.values(plannedSegments).flat().length}
              </div>
              <p className="text-sm text-muted-foreground">Segmentos Agendados</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Object.values(plannedSegments).flat()
                  .reduce((sum, seg) => sum + seg.size, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total de Contatos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Object.values(plannedSegments).flat().length > 0 
                  ? (Object.values(plannedSegments).flat()
                      .reduce((sum, seg) => sum + seg.ctr, 0) / Object.values(plannedSegments).flat().length * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-sm text-muted-foreground">CTR Médio</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                R$ {calculateTotalRevenue().toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Receita Estimada</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}