import { useState } from 'react';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { usePlanner, CampaignSegment } from '@/contexts/PlannerContext';
import { useToast } from '@/hooks/use-toast';

interface DraggedItem {
  id: string;
  type: 'segment' | 'campaign';
  data: CampaignSegment | any;
}

export function usePlannerDragDrop(segments: CampaignSegment[]) {
  const { state, createSlot } = usePlanner();
  const { toast } = useToast();
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const segment = segments.find(s => s.id === active.id);
    
    if (segment) {
      setDraggedItem({ id: segment.id, type: 'segment', data: segment });
    }
  };

  const handleDragEnd = (event: DragEndEvent, onSlotSelected: (date: string, timeSlot: string) => void) => {
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

    // Trigger slot wizard
    onSlotSelected(date, timeSlot);
  };

  return {
    draggedItem,
    handleDragStart,
    handleDragEnd
  };
}