import { useRef } from 'react';
import { usePlanner, PlannedCampaign } from '@/contexts/PlannerContext';
import { useToast } from '@/hooks/use-toast';

export function usePlannerActions() {
  const { createSlot, removeSlot, cloneSlot, undo, redo, canUndo, canRedo } = usePlanner();
  const { toast } = useToast();
  const clipboardRef = useRef<PlannedCampaign | null>(null);

  const copyConfiguration = (campaign: PlannedCampaign) => {
    clipboardRef.current = { ...campaign };
    toast({ title: "Configuração copiada", duration: 2000 });
  };

  const pasteConfiguration = (targetDate: string, targetHour: string) => {
    if (!clipboardRef.current) {
      toast({ title: "Nenhuma configuração copiada", variant: "destructive", duration: 2000 });
      return;
    }

    createSlot(targetDate, targetHour, clipboardRef.current.segmentId, clipboardRef.current.templateId);
    toast({ title: "Configuração colada", duration: 2000 });
  };

  const handleDeleteCampaign = (date: string, timeSlot: string, campaignId: string) => {
    removeSlot(date, timeSlot, campaignId);
    toast({ title: "Campanha removida", duration: 2000 });
  };

  const handleCloneCampaign = (date: string, timeSlot: string, campaignId: string) => {
    cloneSlot(date, timeSlot, campaignId);
    toast({ title: "Campanha clonada", duration: 2000 });
  };

  const handleUndo = () => {
    undo();
    toast({ title: "Alteração desfeita", duration: 2000 });
  };

  const handleRedo = () => {
    redo();
    toast({ title: "Alteração refeita", duration: 2000 });
  };

  return {
    clipboardRef,
    copyConfiguration,
    pasteConfiguration,
    handleDeleteCampaign,
    handleCloneCampaign,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo
  };
}