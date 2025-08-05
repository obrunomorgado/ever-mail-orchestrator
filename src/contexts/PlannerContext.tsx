import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import useUndo from 'use-undo';

export interface CampaignSegment {
  id: string;
  name: string;
  size: number;
  ctr: number;
  erpm: number;
  rfm: string;
  description: string;
  tags: string[];
  lastUpdate: string;
  timeSlot: string;
  campaignType: 'newsletter' | 'alerta' | 'fechamento' | 'breaking';
  vertical: 'cartao' | 'emprestimo' | 'consorcio';
}

export interface PlannedCampaign {
  id: string;
  segmentId: string;
  templateId?: string;
  name: string;
  size: number;
  ctr: number;
  erpm: number;
  rfm: string;
  description: string;
  tags: string[];
  lastUpdate: string;
  timeSlot: string;
  campaignType: 'newsletter' | 'alerta' | 'fechamento' | 'breaking';
  vertical: 'cartao' | 'emprestimo' | 'consorcio';
  estimatedRevenue: number;
  clickLimit: number; // Default click limit for all campaigns
}

export interface RealtimeImpact {
  revenueChange: number;
  overlapRisk: number;
  frequencyCapViolation: boolean;
  deliverabilityScore: number;
  opportunities: string[];
  risks: string[];
}

interface PlannerState {
  availableSegments: CampaignSegment[];
  plannedCampaigns: Record<string, Record<string, PlannedCampaign[]>>; // [date][time][campaigns]
  impact: RealtimeImpact;
  frequencyCap: number;
  isAutoOptimizeEnabled: boolean;
  bestTimeRecommendations: Record<string, { hour: number; confidence: number; lift: number }>;
  // Planner 3.0 additions
  dailyClickGoal: number;
  coolDown: number;
  viewType: 'week' | 'month';
  currentPeriod: Date;
  anchorTimes: string[];
  maxPlanningWindow: number;
}

const initialState: PlannerState = {
  availableSegments: [],
  plannedCampaigns: {},
  impact: {
    revenueChange: 0,
    overlapRisk: 0,
    frequencyCapViolation: false,
    deliverabilityScore: 85,
    opportunities: [],
    risks: []
  },
  frequencyCap: 2,
  isAutoOptimizeEnabled: true,
  bestTimeRecommendations: {},
  dailyClickGoal: 1200,
  coolDown: 3,
  viewType: 'week',
  currentPeriod: new Date(),
  anchorTimes: ['09:00', '14:00', '20:00'],
  maxPlanningWindow: 30
};

interface PlannerContextType {
  state: PlannerState;
  moveSegment: (segmentId: string, fromSlot: string, toSlot: string, date?: string) => void;
  createSlot: (date: string, timeSlot: string, segmentId: string, templateId?: string) => void;
  removeSlot: (date: string, timeSlot: string, slotId: string) => void;
  cloneSlot: (slotId: string, sourceDate: string, targetDate: string) => void;
  duplicateDay: (date: string, offset: number, untilDate?: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  updateImpact: (impact: RealtimeImpact) => void;
  calculateTotalRevenue: () => number;
  checkFrequencyViolations: () => string[];
  getOptimalTime: (segmentId: string, campaignType: string, vertical: string) => { hour: number; confidence: number; lift: number };
  autoOptimizeSchedule: () => void;
  moveSlot: (campaignId: string, fromDate: string, toDate: string) => void;
  copyConfiguration: () => void;
  pasteConfiguration: (targetDate: string, targetHour: string) => void;
  setSlotClickLimit: (date: string, timeSlot: string, campaignId: string, clickLimit: number) => void;
  // Planner 3.0 actions
  setDailyClickGoal: (goal: number) => void;
  setCoolDown: (days: number) => void;
  setViewType: (view: 'week' | 'month') => void;
  setCurrentPeriod: (date: Date) => void;
  setAnchorTimes: (times: string[]) => void;
  setFrequencyCap: (cap: number) => void;
  setMaxPlanningWindow: (window: number) => void;
  calculateProgressToGoal: () => { current: number; target: number; percentage: number };
  getClickStatus: (date: string, timeSlot: string) => 'low' | 'medium' | 'high';
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [plannerState, { set: setPlannerState, undo, redo, canUndo, canRedo }] = useUndo(initialState);
  const state = plannerState.present;
  const { toast } = useToast();
  const clipboardRef = useRef<PlannedCampaign | null>(null);

  const calculateTotalRevenue = useCallback(() => {
    return Object.values(state.plannedCampaigns)
      .flatMap(dateSlots => Object.values(dateSlots))
      .flat()
      .reduce((sum, campaign) => sum + campaign.estimatedRevenue, 0);
  }, [state.plannedCampaigns]);

  const checkFrequencyViolations = useCallback(() => {
    const violations: string[] = [];
    Object.entries(state.plannedCampaigns).forEach(([date, dateSlots]) => {
      Object.entries(dateSlots).forEach(([timeSlot, campaigns]) => {
        if (campaigns.length > state.frequencyCap) {
          violations.push(`${date} ${timeSlot}: ${campaigns.length}/${state.frequencyCap} campanhas`);
        }
      });
    });
    return violations;
  }, [state.plannedCampaigns, state.frequencyCap]);

  const getOptimalTime = useCallback((segmentId: string, campaignType: string, vertical: string) => {
    const recommendation = state.bestTimeRecommendations[segmentId];
    if (recommendation) return recommendation;

    // Fallback logic based on campaign type and vertical
    const timeMap: Record<string, Record<string, number>> = {
      newsletter: { cartao: 9, emprestimo: 10, consorcio: 11 },
      alerta: { cartao: 8, emprestimo: 9, consorcio: 8 },
      fechamento: { cartao: 15, emprestimo: 16, consorcio: 17 },
      breaking: { cartao: 12, emprestimo: 12, consorcio: 12 }
    };

    return {
      hour: timeMap[campaignType]?.[vertical] || 9,
      confidence: 0.6,
      lift: 5.2
    };
  }, [state.bestTimeRecommendations]);

  const updateImpact = useCallback((impact: RealtimeImpact) => {
    setPlannerState({ ...state, impact });
    
    if (impact.frequencyCapViolation) {
      toast({
        title: "Limite de Frequência Violado",
        description: "Alguns horários excedem o limite configurado",
        variant: "destructive"
      });
    }
    
    if (impact.overlapRisk > 0.3) {
      toast({
        title: "Risco de Sobreposição Alto",
        description: `${Math.round(impact.overlapRisk * 100)}% de sobreposição detectada`,
        variant: "destructive"
      });
    }
  }, [setPlannerState, toast]);

  const createSlot = useCallback((date: string, timeSlot: string, segmentId: string, templateId?: string) => {
    const segment = state.availableSegments.find(s => s.id === segmentId);
    if (!segment) return;
    
    const plannedCampaign: PlannedCampaign = {
      ...segment,
      id: nanoid(),
      segmentId: segment.id,
      timeSlot,
      estimatedRevenue: segment.size * segment.ctr * segment.erpm,
      clickLimit: Math.round(segment.size * segment.ctr) // Default: expected clicks
    };
    
    setPlannerState({
      ...state,
      availableSegments: state.availableSegments.filter(s => s.id !== segmentId),
      plannedCampaigns: {
        ...state.plannedCampaigns,
        [date]: {
          ...state.plannedCampaigns[date],
          [timeSlot]: [...(state.plannedCampaigns[date]?.[timeSlot] || []), plannedCampaign]
        }
      }
    });
    
    toast({
      title: "Campanha Agendada",
      description: `Campanha criada para ${date} às ${timeSlot}`,
      duration: 2000
    });
  }, [state.availableSegments, setPlannerState, toast]);
  
  const removeSlot = useCallback((date: string, timeSlot: string, slotId: string) => {
    const campaign = state.plannedCampaigns[date]?.[timeSlot]?.find(c => c.id === slotId);
    if (!campaign) return;
    
    const segment: CampaignSegment = {
      ...campaign,
      id: campaign.segmentId,
      timeSlot: 'available'
    };
    
    setPlannerState({
      ...state,
      availableSegments: [...state.availableSegments, segment],
      plannedCampaigns: {
        ...state.plannedCampaigns,
        [date]: {
          ...state.plannedCampaigns[date],
          [timeSlot]: state.plannedCampaigns[date][timeSlot].filter(c => c.id !== slotId)
        }
      }
    });
    
    toast({
      title: "Campanha Removida",
      description: "Campanha foi removida do calendário",
      duration: 2000
    });
  }, [state.plannedCampaigns, setPlannerState, toast]);
  
  const cloneSlot = useCallback((slotId: string, sourceDate: string, targetDate: string) => {
    let campaignToClone: PlannedCampaign | undefined;
    let sourceTimeSlot = '';
    
    // Find the campaign across all time slots
    const sourceDateSlots = state.plannedCampaigns[sourceDate];
    if (!sourceDateSlots) return;
    
    for (const [timeSlot, campaigns] of Object.entries(sourceDateSlots)) {
      const found = campaigns.find(c => c.id === slotId);
      if (found) {
        campaignToClone = found;
        sourceTimeSlot = timeSlot;
        break;
      }
    }
    
    if (!campaignToClone) return;
    
    const clonedCampaign: PlannedCampaign = {
      ...campaignToClone,
      id: nanoid()
    };
    
    setPlannerState({
      ...state,
      plannedCampaigns: {
        ...state.plannedCampaigns,
        [targetDate]: {
          ...state.plannedCampaigns[targetDate],
          [sourceTimeSlot]: [...(state.plannedCampaigns[targetDate]?.[sourceTimeSlot] || []), clonedCampaign]
        }
      }
    });
    
    toast({
      title: "Campanha Clonada",
      description: `Campanha duplicada para ${targetDate}`,
      duration: 2000
    });
  }, [state.plannedCampaigns, setPlannerState, toast]);
  
  const duplicateDay = useCallback((date: string, offset: number, untilDate?: string) => {
    const sourceDateSlots = state.plannedCampaigns[date];
    if (!sourceDateSlots) return;
    
    const targetDate = new Date(date);
    targetDate.setDate(targetDate.getDate() + offset);
    const targetDateString = targetDate.toISOString().split('T')[0];
    
    const clonedSlots: Record<string, PlannedCampaign[]> = {};
    
    for (const [timeSlot, campaigns] of Object.entries(sourceDateSlots)) {
      clonedSlots[timeSlot] = campaigns.map(campaign => ({
        ...campaign,
        id: nanoid()
      }));
    }
    
    setPlannerState({
      ...state,
      plannedCampaigns: {
        ...state.plannedCampaigns,
        [targetDateString]: clonedSlots
      }
    });
    
    toast({
      title: "Dia Duplicado",
      description: `Campanhas duplicadas para ${targetDate.toLocaleDateString()}`,
      duration: 2000
    });
  }, [state.plannedCampaigns, setPlannerState, toast]);

  const setSlotClickLimit = useCallback((date: string, timeSlot: string, campaignId: string, clickLimit: number) => {
    setPlannerState({
      ...state,
      plannedCampaigns: {
        ...state.plannedCampaigns,
        [date]: {
          ...state.plannedCampaigns[date],
          [timeSlot]: state.plannedCampaigns[date]?.[timeSlot]?.map(campaign =>
            campaign.id === campaignId
              ? { ...campaign, clickLimit }
              : campaign
          ) || []
        }
      }
    });
  }, [setPlannerState]);

  const getClickStatus = useCallback((date: string, timeSlot: string): 'low' | 'medium' | 'high' => {
    const campaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
    const totalClicks = campaigns.reduce((sum, campaign) => sum + (campaign.size * campaign.ctr), 0);
    const totalLimit = campaigns.reduce((sum, campaign) => sum + campaign.clickLimit, 0);
    
    if (totalLimit === 0) return 'low';
    
    const utilization = totalClicks / totalLimit;
    if (utilization >= 1) return 'high';
    if (utilization >= 0.8) return 'medium';
    return 'low';
  }, [state.plannedCampaigns]);

  const copyConfiguration = useCallback(() => {
    // For now, just copy the first campaign we find as example
    const firstCampaign = Object.values(state.plannedCampaigns)
      .flatMap(dateSlots => Object.values(dateSlots))
      .flat()[0];
    
    if (firstCampaign) {
      clipboardRef.current = firstCampaign;
      toast({
        title: "Configuração Copiada",
        description: "Use Ctrl+V para colar em outra célula",
        duration: 2000
      });
    }
  }, [state.plannedCampaigns, toast]);

  const pasteConfiguration = useCallback((targetDate: string, targetHour: string) => {
    if (!clipboardRef.current) return;
    
    const clonedCampaign: PlannedCampaign = {
      ...clipboardRef.current,
      id: nanoid(),
      timeSlot: targetHour
    };
    
    setPlannerState({
      ...state,
      plannedCampaigns: {
        ...state.plannedCampaigns,
        [targetDate]: {
          ...state.plannedCampaigns[targetDate],
          [targetHour]: [...(state.plannedCampaigns[targetDate]?.[targetHour] || []), clonedCampaign]
        }
      }
    });
    
    toast({
      title: "Configuração Colada",
      description: `Campanha colada em ${targetDate} às ${targetHour}`,
      duration: 2000
    });
  }, [setPlannerState, toast]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
          toast({ title: "Alteração desfeita", description: "Última alteração foi revertida" });
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
          toast({ title: "Alteração refeita", description: "Alteração foi reaplicada" });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo, toast]);

  // Planner 3.0 functions
  const setDailyClickGoal = useCallback((goal: number) => {
    setPlannerState({ ...state, dailyClickGoal: goal });
    toast({
      title: "Meta Atualizada",
      description: `Nova meta diária: ${goal.toLocaleString()} cliques`,
      duration: 2000
    });
  }, [setPlannerState, toast]);

  const setCoolDown = useCallback((days: number) => {
    setPlannerState({ ...state, coolDown: days });
    toast({
      title: "Cool-down Atualizado",
      description: `Período mínimo entre campanhas: ${days} dias`,
      duration: 2000
    });
  }, [setPlannerState, toast]);

  const setViewType = useCallback((view: 'week' | 'month') => {
    setPlannerState({ ...state, viewType: view });
  }, [setPlannerState]);

  const setCurrentPeriod = useCallback((date: Date) => {
    setPlannerState({ ...state, currentPeriod: date });
  }, [setPlannerState]);

  const setAnchorTimes = useCallback((times: string[]) => {
    setPlannerState({ ...state, anchorTimes: times });
    toast({
      title: "Horários-âncora Atualizados",
      description: `Novos horários: ${times.join(', ')}`,
      duration: 2000
    });
  }, [setPlannerState, toast]);

  const setFrequencyCap = useCallback((cap: number) => {
    setPlannerState({ ...state, frequencyCap: cap });
    toast({
      title: "Frequency Cap Atualizado",
      description: `Novo limite: ${cap} email(s) por destinatário/24h`,
      duration: 2000
    });
  }, [setPlannerState, toast]);

  const setMaxPlanningWindow = useCallback((window: number) => {
    setPlannerState({ ...state, maxPlanningWindow: window });
    toast({
      title: "Janela de Planejamento Atualizada",
      description: `Máximo: ${window} dias no futuro`,
      duration: 2000
    });
  }, [setPlannerState, toast]);

  const calculateProgressToGoal = useCallback(() => {
    const currentClicks = Object.values(state.plannedCampaigns)
      .flatMap(dateSlots => Object.values(dateSlots))
      .flat()
      .reduce((sum, campaign) => sum + (campaign.size * campaign.ctr), 0);
    
    const percentage = Math.min((currentClicks / state.dailyClickGoal) * 100, 100);
    
    return {
      current: Math.round(currentClicks),
      target: state.dailyClickGoal,
      percentage: Math.round(percentage)
    };
  }, [state.plannedCampaigns, state.dailyClickGoal]);

  const value: PlannerContextType = {
    state,
    moveSegment: () => {}, // Legacy
    createSlot,
    removeSlot,
    cloneSlot,
    duplicateDay,
    undo,
    redo,
    canUndo,
    canRedo,
    updateImpact,
    calculateTotalRevenue,
    checkFrequencyViolations,
    getOptimalTime,
    autoOptimizeSchedule: () => {},
    moveSlot: cloneSlot,
    copyConfiguration,
    pasteConfiguration,
    setSlotClickLimit,
    setDailyClickGoal,
    setCoolDown,
    setViewType,
    setCurrentPeriod,
    setAnchorTimes,
    setFrequencyCap,
    setMaxPlanningWindow,
    calculateProgressToGoal,
    getClickStatus
  };

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}