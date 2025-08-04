import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

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
}

export interface RealtimeImpact {
  revenueChange: number;
  overlapRisk: number;
  frequencyCapViolation: boolean;
  deliverabilityScore: number;
  opportunities: string[];
  risks: string[];
}

export interface ActionHistory {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  impact: RealtimeImpact;
}

interface PlannerState {
  availableSegments: CampaignSegment[];
  plannedCampaigns: Record<string, PlannedCampaign[]>;
  impact: RealtimeImpact;
  history: ActionHistory[];
  historyIndex: number;
  frequencyCap: number;
  isAutoOptimizeEnabled: boolean;
  bestTimeRecommendations: Record<string, { hour: number; confidence: number; lift: number }>;
  // Planner 3.0 additions
  dailyClickGoal: number;
  coolDown: number;
  viewType: 'week' | 'month';
  currentPeriod: Date;
  anchorTimes: string[];
}

type PlannerAction =
  | { type: 'MOVE_SEGMENT'; payload: { segmentId: string; fromSlot: string; toSlot: string } }
  | { type: 'ADD_ACTION'; payload: ActionHistory }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_IMPACT'; payload: RealtimeImpact }
  | { type: 'TOGGLE_AUTO_OPTIMIZE' }
  | { type: 'SET_FREQUENCY_CAP'; payload: number }
  | { type: 'UPDATE_BEST_TIME'; payload: { segmentId: string; hour: number; confidence: number; lift: number } }
  | { type: 'SET_DAILY_CLICK_GOAL'; payload: number }
  | { type: 'SET_COOL_DOWN'; payload: number }
  | { type: 'SET_VIEW_TYPE'; payload: 'week' | 'month' }
  | { type: 'SET_CURRENT_PERIOD'; payload: Date }
  | { type: 'SET_ANCHOR_TIMES'; payload: string[] };

const initialState: PlannerState = {
  availableSegments: [],
  plannedCampaigns: {
    '07:00': [],
    '09:00': [],
    '12:00': [],
    '15:00': [],
    '18:00': [],
    '20:00': []
  },
  impact: {
    revenueChange: 0,
    overlapRisk: 0,
    frequencyCapViolation: false,
    deliverabilityScore: 85,
    opportunities: [],
    risks: []
  },
  history: [],
  historyIndex: -1,
  frequencyCap: 2, // Default to 2 emails per recipient/24h
  isAutoOptimizeEnabled: true,
  bestTimeRecommendations: {},
  // Planner 3.0 defaults
  dailyClickGoal: 1200, // Will be overridden by usePlannerDefaults
  coolDown: 3,
  viewType: 'week',
  currentPeriod: new Date(),
  anchorTimes: ['09:00', '14:00', '20:00']
};

function plannerReducer(state: PlannerState, action: PlannerAction): PlannerState {
  switch (action.type) {
    case 'MOVE_SEGMENT': {
      // Complex logic for moving segments and updating impact
      const { segmentId, fromSlot, toSlot } = action.payload;
      
      if (fromSlot === 'available') {
        // Moving from available to time slot
        const segment = state.availableSegments.find(s => s.id === segmentId);
        if (!segment) return state;
        
        const plannedCampaign: PlannedCampaign = {
          ...segment,
          id: `${segment.id}-${toSlot}`,
          segmentId: segment.id,
          timeSlot: toSlot,
          estimatedRevenue: segment.size * segment.ctr * segment.erpm
        };
        
        return {
          ...state,
          availableSegments: state.availableSegments.filter(s => s.id !== segmentId),
          plannedCampaigns: {
            ...state.plannedCampaigns,
            [toSlot]: [...state.plannedCampaigns[toSlot], plannedCampaign]
          }
        };
      } else if (toSlot === 'available') {
        // Moving back to available
        const campaign = state.plannedCampaigns[fromSlot]?.find(c => c.segmentId === segmentId);
        if (!campaign) return state;
        
        const segment: CampaignSegment = {
          ...campaign,
          id: campaign.segmentId,
          timeSlot: 'available'
        };
        
        return {
          ...state,
          availableSegments: [...state.availableSegments, segment],
          plannedCampaigns: {
            ...state.plannedCampaigns,
            [fromSlot]: state.plannedCampaigns[fromSlot].filter(c => c.segmentId !== segmentId)
          }
        };
      } else {
        // Moving between time slots
        const campaign = state.plannedCampaigns[fromSlot]?.find(c => c.segmentId === segmentId);
        if (!campaign) return state;
        
        const updatedCampaign = { ...campaign, timeSlot: toSlot, id: `${campaign.segmentId}-${toSlot}` };
        
        return {
          ...state,
          plannedCampaigns: {
            ...state.plannedCampaigns,
            [fromSlot]: state.plannedCampaigns[fromSlot].filter(c => c.segmentId !== segmentId),
            [toSlot]: [...state.plannedCampaigns[toSlot], updatedCampaign]
          }
        };
      }
    }
    
    case 'ADD_ACTION':
      return {
        ...state,
        history: [...state.history.slice(0, state.historyIndex + 1), action.payload],
        historyIndex: state.historyIndex + 1
      };
    
    case 'UNDO':
      return {
        ...state,
        historyIndex: Math.max(-1, state.historyIndex - 1)
      };
    
    case 'REDO':
      return {
        ...state,
        historyIndex: Math.min(state.history.length - 1, state.historyIndex + 1)
      };
    
    case 'UPDATE_IMPACT':
      return {
        ...state,
        impact: action.payload
      };
    
    case 'TOGGLE_AUTO_OPTIMIZE':
      return {
        ...state,
        isAutoOptimizeEnabled: !state.isAutoOptimizeEnabled
      };
    
    case 'SET_FREQUENCY_CAP':
      return {
        ...state,
        frequencyCap: action.payload
      };
    
    case 'UPDATE_BEST_TIME':
      return {
        ...state,
        bestTimeRecommendations: {
          ...state.bestTimeRecommendations,
          [action.payload.segmentId]: {
            hour: action.payload.hour,
            confidence: action.payload.confidence,
            lift: action.payload.lift
          }
        }
      };
    
    case 'SET_DAILY_CLICK_GOAL':
      return {
        ...state,
        dailyClickGoal: action.payload
      };
    
    case 'SET_COOL_DOWN':
      return {
        ...state,
        coolDown: action.payload
      };
    
    case 'SET_VIEW_TYPE':
      return {
        ...state,
        viewType: action.payload
      };
    
    case 'SET_CURRENT_PERIOD':
      return {
        ...state,
        currentPeriod: action.payload
      };
    
    case 'SET_ANCHOR_TIMES':
      return {
        ...state,
        anchorTimes: action.payload
      };
    
    default:
      return state;
  }
}

interface PlannerContextType {
  state: PlannerState;
  moveSegment: (segmentId: string, fromSlot: string, toSlot: string) => void;
  undo: () => void;
  redo: () => void;
  updateImpact: (impact: RealtimeImpact) => void;
  calculateTotalRevenue: () => number;
  checkFrequencyViolations: () => string[];
  getOptimalTime: (segmentId: string, campaignType: string, vertical: string) => { hour: number; confidence: number; lift: number };
  autoOptimizeSchedule: () => void;
  // Planner 3.0 actions
  setDailyClickGoal: (goal: number) => void;
  setCoolDown: (days: number) => void;
  setViewType: (view: 'week' | 'month') => void;
  setCurrentPeriod: (date: Date) => void;
  setAnchorTimes: (times: string[]) => void;
  calculateProgressToGoal: () => { current: number; target: number; percentage: number };
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(plannerReducer, initialState);
  const { toast } = useToast();

  const calculateTotalRevenue = useCallback(() => {
    return Object.values(state.plannedCampaigns)
      .flat()
      .reduce((sum, campaign) => sum + campaign.estimatedRevenue, 0);
  }, [state.plannedCampaigns]);

  const checkFrequencyViolations = useCallback(() => {
    const violations: string[] = [];
    Object.entries(state.plannedCampaigns).forEach(([timeSlot, campaigns]) => {
      if (campaigns.length > state.frequencyCap) {
        violations.push(`${timeSlot}: ${campaigns.length}/${state.frequencyCap} campanhas`);
      }
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
    dispatch({ type: 'UPDATE_IMPACT', payload: impact });
    
    // Show toast notifications for violations
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
  }, [toast]);

  const moveSegment = useCallback((segmentId: string, fromSlot: string, toSlot: string) => {
    dispatch({ type: 'MOVE_SEGMENT', payload: { segmentId, fromSlot, toSlot } });
    
    // Calculate impact
    const revenueChange = Math.random() * 500 - 250; // Mock calculation
    const newImpact: RealtimeImpact = {
      revenueChange,
      overlapRisk: Math.random() * 0.5,
      frequencyCapViolation: checkFrequencyViolations().length > 0,
      deliverabilityScore: 85 + Math.random() * 10,
      opportunities: revenueChange > 0 ? [`+R$ ${Math.abs(revenueChange).toFixed(0)} por otimização de horário`] : [],
      risks: revenueChange < 0 ? [`-R$ ${Math.abs(revenueChange).toFixed(0)} por horário sub-ótimo`] : []
    };
    
    updateImpact(newImpact);
    
    // Add to history
    const action: ActionHistory = {
      id: `action-${Date.now()}`,
      action: `Moveu ${segmentId} de ${fromSlot} para ${toSlot}`,
      description: `Campanha reagendada com impacto de R$ ${revenueChange.toFixed(0)}`,
      timestamp: new Date(),
      impact: newImpact
    };
    
    dispatch({ type: 'ADD_ACTION', payload: action });
  }, [checkFrequencyViolations, updateImpact]);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
    toast({ title: "Ação desfeita", description: "Última alteração foi revertida" });
  }, [toast]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
    toast({ title: "Ação refeita", description: "Alteração foi reaplicada" });
  }, [toast]);

  const autoOptimizeSchedule = useCallback(() => {
    // Mock auto-optimization logic
    toast({
      title: "Otimização Automática",
      description: "Analisando melhor horário para todas as campanhas...",
    });
    
    setTimeout(() => {
      toast({
        title: "Otimização Concluída",
        description: "3 campanhas foram reagendadas. Receita estimada +R$ 1.200",
        variant: "default"
      });
    }, 2000);
  }, [toast]);

  // Planner 3.0 functions
  const setDailyClickGoal = useCallback((goal: number) => {
    console.log('[Planner] Setting daily click goal:', goal);
    dispatch({ type: 'SET_DAILY_CLICK_GOAL', payload: goal });
    
    toast({
      title: "Meta Atualizada",
      description: `Nova meta diária: ${goal.toLocaleString()} cliques`,
      duration: 2000
    });
  }, [toast]);

  const setCoolDown = useCallback((days: number) => {
    console.log('[Planner] Setting cool-down period:', days);
    dispatch({ type: 'SET_COOL_DOWN', payload: days });
    
    toast({
      title: "Cool-down Atualizado",
      description: `Período mínimo entre campanhas: ${days} dias`,
      duration: 2000
    });
  }, [toast]);

  const setViewType = useCallback((view: 'week' | 'month') => {
    console.log('[Planner] Changing view type to:', view);
    dispatch({ type: 'SET_VIEW_TYPE', payload: view });
  }, []);

  const setCurrentPeriod = useCallback((date: Date) => {
    console.log('[Planner] Setting current period:', date);
    dispatch({ type: 'SET_CURRENT_PERIOD', payload: date });
  }, []);

  const setAnchorTimes = useCallback((times: string[]) => {
    console.log('[Planner] Setting anchor times:', times);
    dispatch({ type: 'SET_ANCHOR_TIMES', payload: times });
    
    toast({
      title: "Horários-âncora Atualizados",
      description: `Novos horários: ${times.join(', ')}`,
      duration: 2000
    });
  }, [toast]);

  const calculateProgressToGoal = useCallback(() => {
    // Calculate current clicks based on planned campaigns
    const currentClicks = Object.values(state.plannedCampaigns)
      .flat()
      .reduce((sum, campaign) => sum + (campaign.size * campaign.ctr), 0);
    
    const percentage = Math.min((currentClicks / state.dailyClickGoal) * 100, 100);
    
    return {
      current: Math.round(currentClicks),
      target: state.dailyClickGoal,
      percentage: Math.round(percentage)
    };
  }, [state.plannedCampaigns, state.dailyClickGoal]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [undo, redo]);

  const value: PlannerContextType = {
    state,
    moveSegment,
    undo,
    redo,
    updateImpact,
    calculateTotalRevenue,
    checkFrequencyViolations,
    getOptimalTime,
    autoOptimizeSchedule,
    // Planner 3.0 functions
    setDailyClickGoal,
    setCoolDown,
    setViewType,
    setCurrentPeriod,
    setAnchorTimes,
    calculateProgressToGoal
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