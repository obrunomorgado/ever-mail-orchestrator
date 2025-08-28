import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import { DispatchCard } from './DispatchCard';
import { ScheduledDispatch } from '@/types/scheduler';
import { timeSlots } from '@/mocks/schedulerData';
import { cn } from '@/lib/utils';

interface TimelineGridProps {
  date: string;
  dispatches: ScheduledDispatch[];
  selectedDispatch?: ScheduledDispatch;
  onDispatchSelect: (dispatch: ScheduledDispatch) => void;
  onDispatchUpdate: (dispatch: ScheduledDispatch) => void;
  onDispatchDelete: (id: string) => void;
  onCreateDispatch: (timeSlot: string) => void;
  onDropDispatch?: (timeSlot: string, dispatch: ScheduledDispatch) => void;
  draggedItem?: any;
}

export function TimelineGrid({
  date,
  dispatches,
  selectedDispatch,
  onDispatchSelect,
  onDispatchUpdate,
  onDispatchDelete,
  onCreateDispatch,
  onDropDispatch,
  draggedItem
}: TimelineGridProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  // Organizar dispatches por horário
  const dispatchesByTime = dispatches.reduce((acc, dispatch) => {
    if (dispatch.date === date) {
      acc[dispatch.timeSlot] = dispatch;
    }
    return acc;
  }, {} as Record<string, ScheduledDispatch>);

  // Detectar conflitos de assunto
  const subjectMap = new Map<string, string[]>();
  dispatches.forEach(dispatch => {
    const subject = dispatch.customSubject || dispatch.template?.subject;
    if (subject) {
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, []);
      }
      subjectMap.get(subject)!.push(dispatch.id);
    }
  });

  const getSubjectConflicts = (dispatch: ScheduledDispatch): boolean => {
    const subject = dispatch.customSubject || dispatch.template?.subject;
    return subject ? (subjectMap.get(subject)?.length || 0) > 1 : false;
  };

  const handleSlotClick = (timeSlot: string) => {
    const existingDispatch = dispatchesByTime[timeSlot];
    if (existingDispatch) {
      onDispatchSelect(existingDispatch);
    } else {
      onCreateDispatch(timeSlot);
    }
  };

  const handleDrop = (timeSlot: string, e: React.DragEvent) => {
    e.preventDefault();
    if (onDropDispatch && draggedItem) {
      // Logic for handling drop will be implemented
      console.log('Drop:', timeSlot, draggedItem);
    }
  };

  const isSlotAvailable = (timeSlot: string) => {
    return !dispatchesByTime[timeSlot];
  };

  const canDropHere = (timeSlot: string) => {
    return draggedItem && isSlotAvailable(timeSlot);
  };

  return (
    <div className="space-y-2">
      {/* Cabeçalho da grade */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-lg">
          Timeline - {new Date(date).toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </h3>
      </div>

      {/* Grade de horários */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {timeSlots.map((timeSlot) => {
          const dispatch = dispatchesByTime[timeSlot];
          const hasConflict = dispatch ? getSubjectConflicts(dispatch) : false;
          const isSelected = selectedDispatch?.id === dispatch?.id;
          const isHovered = hoveredSlot === timeSlot;
          const canDrop = canDropHere(timeSlot);

          return (
            <div
              key={timeSlot}
              className={cn(
                "relative transition-all",
                isHovered && "scale-[1.02]"
              )}
              onMouseEnter={() => setHoveredSlot(timeSlot)}
              onMouseLeave={() => setHoveredSlot(null)}
              onDrop={(e) => handleDrop(timeSlot, e)}
              onDragOver={(e) => e.preventDefault()}
            >
              {dispatch ? (
                <DispatchCard
                  dispatch={dispatch}
                  onUpdate={onDispatchUpdate}
                  onSelect={onDispatchSelect}
                  onDelete={onDispatchDelete}
                  isSelected={isSelected}
                  hasSubjectConflict={hasConflict}
                />
              ) : (
                <Card 
                  className={cn(
                    "p-4 border-2 border-dashed cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30",
                    canDrop && "border-primary bg-primary/10",
                    isHovered && "border-primary/70 bg-muted/50"
                  )}
                  onClick={() => handleSlotClick(timeSlot)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {canDrop ? (
                        <span className="text-sm text-primary font-medium">
                          Solte aqui para agendar
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateDispatch(timeSlot);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {isHovered && !dispatch && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Clique para criar um novo disparo neste horário
                    </p>
                  )}
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}