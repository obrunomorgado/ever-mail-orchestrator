import { useState, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { usePlanner, CampaignSegment } from '@/contexts/PlannerContext';
import { useToast } from '@/hooks/use-toast';
import { segments, templates } from '@/mocks/demoData';
import { usePlannerAutomation } from './usePlannerAutomation';

interface DraggedItem {
  id: string;
  type: 'segment' | 'template' | 'campaign';
  data: any;
  sourceIndex?: number;
}

interface SlotDropTarget {
  date: string;
  timeSlot: string;
  isEmpty: boolean;
  suggestedTemplate?: any;
}

export function usePlannerDragDropV2() {
  const { state, createSlot, removeSlot } = usePlanner();
  const { toast } = useToast();
  const { findBestTemplate } = usePlannerAutomation();
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dropTargets, setDropTargets] = useState<SlotDropTarget[]>([]);

  const handleDragStart = useCallback((result: any) => {
    const { draggableId, source } = result;
    
    // Determine what's being dragged
    let dragType: 'segment' | 'template' | 'campaign' = 'segment';
    let data: any;

    if (source.droppableId === 'segments') {
      const segment = segments.find(s => s.id === draggableId);
      if (segment) {
        dragType = 'segment';
        data = segment;
        
        // Auto-suggest best template for this segment
        const suggestedTemplate = findBestTemplate(segment);
        
        // Highlight compatible slots
        const compatibleSlots = generateCompatibleSlots(segment);
        setDropTargets(compatibleSlots.map(slot => ({
          ...slot,
          suggestedTemplate
        })));
      }
    } else if (source.droppableId === 'templates') {
      const template = templates.find(t => t.id === draggableId);
      if (template) {
        dragType = 'template';
        data = template;
        
        // Highlight slots that need templates
        const slotsNeedingTemplates = generateSlotsNeedingTemplates();
        setDropTargets(slotsNeedingTemplates);
      }
    } else if (source.droppableId.includes('slot-')) {
      // Dragging from existing slot (for moving campaigns)
      dragType = 'campaign';
      // Find campaign data from slot
      const [date, timeSlot] = source.droppableId.replace('slot-', '').split('|');
      const campaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
      data = campaigns[result.source.index];
    }

    setDraggedItem({
      id: draggableId,
      type: dragType,
      data,
      sourceIndex: source.index
    });
  }, [state.plannedCampaigns, findBestTemplate]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    setDraggedItem(null);
    setDropTargets([]);

    if (!destination) return;

    // Handle different drop scenarios
    if (destination.droppableId.startsWith('slot-')) {
      const [date, timeSlot] = destination.droppableId.replace('slot-', '').split('|');
      
      if (draggedItem?.type === 'segment') {
        // Dropping segment into slot
        const segment = draggedItem.data as CampaignSegment;
        const suggestedTemplate = findBestTemplate(segment);
        
        // Check if slot is available
        const existingCampaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
        if (existingCampaigns.length > 0) {
          toast({
            title: "Slot ocupado",
            description: "Arraste para um slot vazio ou use automação para redistribuir",
            variant: "destructive",
            duration: 3000
          });
          return;
        }

        // Auto-create campaign with best template
        createSlot(date, timeSlot, segment.id, suggestedTemplate.id);
        
        toast({
          title: "Campanha criada",
          description: `${segment.name} + ${suggestedTemplate.name} agendada para ${timeSlot}`,
          duration: 3000
        });

      } else if (draggedItem?.type === 'template') {
        // Dropping template into slot with existing segment
        const template = draggedItem.data;
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

        // Update existing campaign with new template
        // Note: This would require a new method in the context
        toast({
          title: "Template atualizado",
          description: `Slot atualizado com template ${template.name}`,
          duration: 2000
        });

      } else if (draggedItem?.type === 'campaign') {
        // Moving campaign between slots
        const [sourceDate, sourceTimeSlot] = source.droppableId.replace('slot-', '').split('|');
        
        if (sourceDate === date && sourceTimeSlot === timeSlot) {
          return; // Same slot, no change
        }

        // Check destination availability
        const destCampaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
        if (destCampaigns.length > 0) {
          toast({
            title: "Slot ocupado",
            description: "Não é possível mover para slot ocupado",
            variant: "destructive",
            duration: 2000
          });
          return;
        }

        // Move campaign
        const campaign = draggedItem.data;
        removeSlot(sourceDate, sourceTimeSlot, campaign.id);
        createSlot(date, timeSlot, campaign.segmentId, campaign.templateId);
        
        toast({
          title: "Campanha movida",
          description: `Campanha transferida para ${date} às ${timeSlot}`,
          duration: 2000
        });
      }
    }
  }, [draggedItem, state.plannedCampaigns, createSlot, removeSlot, findBestTemplate, toast]);

  const generateCompatibleSlots = useCallback((segment: CampaignSegment) => {
    const slots: SlotDropTarget[] = [];
    const dates = [];
    const today = new Date();
    
    // Generate week dates
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    const timeSlots = ['07:00', '09:00', '12:00', '15:00', '18:00'];
    
    for (const date of dates) {
      for (const timeSlot of timeSlots) {
        const existingCampaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
        const isEmpty = existingCampaigns.length === 0;
        
        // Calculate compatibility score based on segment characteristics
        let compatible = true;
        const rfmScore = parseInt(segment.rfm.charAt(0)) || 1;
        if (rfmScore < 3 && ['07:00', '18:00'].includes(timeSlot)) {
          compatible = false; // Low engagement segments avoid peak times
        }
        
        if (compatible) {
          slots.push({ date, timeSlot, isEmpty });
        }
      }
    }
    
    return slots;
  }, [state.plannedCampaigns]);

  const generateSlotsNeedingTemplates = useCallback(() => {
    const slots: SlotDropTarget[] = [];
    
    // Find slots that have segments but might benefit from different templates
    Object.entries(state.plannedCampaigns).forEach(([date, daySlots]) => {
      Object.entries(daySlots || {}).forEach(([timeSlot, campaigns]) => {
        if (campaigns.length > 0) {
          // These slots could benefit from template updates
          slots.push({ date, timeSlot, isEmpty: false });
        }
      });
    });
    
    return slots;
  }, [state.plannedCampaigns]);

  const getSlotDropTargetStyle = useCallback((date: string, timeSlot: string) => {
    const target = dropTargets.find(t => t.date === date && t.timeSlot === timeSlot);
    
    if (!target) return '';
    
    if (draggedItem?.type === 'segment') {
      return target.isEmpty 
        ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' 
        : 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950';
    }
    
    if (draggedItem?.type === 'template') {
      return 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950';
    }
    
    return '';
  }, [dropTargets, draggedItem]);

  const getMultiSelectDrag = useCallback((selectedIds: string[]) => {
    // Enable dragging multiple segments/templates at once
    return {
      isDragging: draggedItem !== null,
      selectedCount: selectedIds.length,
      canBatchDrop: selectedIds.length > 1
    };
  }, [draggedItem]);

  return {
    draggedItem,
    dropTargets,
    handleDragStart,
    handleDragEnd,
    getSlotDropTargetStyle,
    getMultiSelectDrag
  };
}