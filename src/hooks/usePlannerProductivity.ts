import { useState, useCallback, useEffect } from 'react';
import { usePlanner } from '@/contexts/PlannerContext';

interface ProductivitySession {
  id: string;
  startTime: number;
  endTime?: number;
  actionsCount: number;
  automationUsed: number;
  manualActions: number;
  efficiency: number;
  goal: 'quick-plan' | 'full-week' | 'optimization';
}

interface ProductivityMetrics {
  currentSession: ProductivitySession | null;
  averageTimePerSlot: number;
  automationSavings: number;
  weeklyEfficiency: number;
  comparedToManual: number;
  sessionsHistory: ProductivitySession[];
}

const MANUAL_BASELINE = {
  timePerSlot: 5, // 5 minutes per slot manually
  totalWeekly: 175, // 35 slots × 5 min = 175 min baseline
  errorRate: 0.15 // 15% error rate manual
};

export function usePlannerProductivity() {
  const { state } = usePlanner();
  const [metrics, setMetrics] = useState<ProductivityMetrics>({
    currentSession: null,
    averageTimePerSlot: 0,
    automationSavings: 0,
    weeklyEfficiency: 0,
    comparedToManual: 0,
    sessionsHistory: []
  });

  const startSession = useCallback((goal: ProductivitySession['goal'] = 'quick-plan') => {
    const session: ProductivitySession = {
      id: `session-${Date.now()}`,
      startTime: Date.now(),
      actionsCount: 0,
      automationUsed: 0,
      manualActions: 0,
      efficiency: 0,
      goal
    };
    
    setMetrics(prev => ({
      ...prev,
      currentSession: session
    }));
    
    return session.id;
  }, []);

  const endSession = useCallback(() => {
    setMetrics(prev => {
      if (!prev.currentSession) return prev;

      const endTime = Date.now();
      const duration = endTime - prev.currentSession.startTime;
      const totalActions = prev.currentSession.automationUsed + prev.currentSession.manualActions;
      
      const completedSession: ProductivitySession = {
        ...prev.currentSession,
        endTime,
        efficiency: totalActions > 0 ? Math.round((prev.currentSession.automationUsed / totalActions) * 100) : 0
      };

      const updatedHistory = [...prev.sessionsHistory, completedSession].slice(-10); // Keep last 10 sessions
      
      // Calculate new averages
      const avgTimePerSlot = updatedHistory.length > 0 
        ? updatedHistory.reduce((sum, s) => sum + ((s.endTime! - s.startTime) / Math.max(s.actionsCount, 1)), 0) / updatedHistory.length
        : 0;

      const avgAutomation = updatedHistory.length > 0
        ? updatedHistory.reduce((sum, s) => sum + s.efficiency, 0) / updatedHistory.length
        : 0;

      const timeSaved = MANUAL_BASELINE.timePerSlot - (avgTimePerSlot / 60000); // Convert to minutes
      const automationSavings = Math.max(0, timeSaved);
      
      return {
        currentSession: null,
        averageTimePerSlot: avgTimePerSlot / 60000, // Convert to minutes
        automationSavings,
        weeklyEfficiency: avgAutomation,
        comparedToManual: Math.max(0, ((MANUAL_BASELINE.totalWeekly - (avgTimePerSlot * totalActions / 60000)) / MANUAL_BASELINE.totalWeekly) * 100),
        sessionsHistory: updatedHistory
      };
    });
  }, []);

  const trackAction = useCallback((type: 'automation' | 'manual', count = 1) => {
    setMetrics(prev => {
      if (!prev.currentSession) return prev;

      return {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          actionsCount: prev.currentSession.actionsCount + count,
          automationUsed: prev.currentSession.automationUsed + (type === 'automation' ? count : 0),
          manualActions: prev.currentSession.manualActions + (type === 'manual' ? count : 0)
        }
      };
    });
  }, []);

  const getCurrentSessionTime = useCallback(() => {
    if (!metrics.currentSession) return 0;
    return Math.round((Date.now() - metrics.currentSession.startTime) / 1000);
  }, [metrics.currentSession]);

  const getProductivityInsights = useCallback(() => {
    const insights = [];
    
    if (metrics.averageTimePerSlot > 3) {
      insights.push({
        type: 'warning',
        message: 'Tempo por slot acima da média. Considere usar mais automação.',
        suggestion: 'Use "Auto-Fill Best Slots" para acelerar o processo'
      });
    }
    
    if (metrics.weeklyEfficiency < 50) {
      insights.push({
        type: 'tip',
        message: 'Baixo uso de automação detectado.',
        suggestion: 'Experimente o "Smart Weekly Plan" para economia de tempo'
      });
    }
    
    if (metrics.comparedToManual > 70) {
      insights.push({
        type: 'success',
        message: `Você está ${Math.round(metrics.comparedToManual)}% mais rápido que o método manual!`,
        suggestion: 'Continue usando as automações para manter a eficiência'
      });
    }

    // Calculate estimated manual time for current planned slots
    const totalSlots = Object.values(state.plannedCampaigns).reduce((total, daySlots) => {
      return total + Object.values(daySlots).reduce((dayTotal, campaigns) => dayTotal + campaigns.length, 0);
    }, 0);

    if (totalSlots > 0) {
      const manualTime = totalSlots * MANUAL_BASELINE.timePerSlot;
      const currentTime = metrics.currentSession 
        ? getCurrentSessionTime() / 60 
        : metrics.averageTimePerSlot * totalSlots;
      
      const savings = Math.max(0, manualTime - currentTime);
      
      if (savings > 60) {
        insights.push({
          type: 'achievement',
          message: `Você economizou ${Math.round(savings)} minutos nesta sessão!`,
          suggestion: `Isso representa ${Math.round((savings / manualTime) * 100)}% de economia vs método manual`
        });
      }
    }
    
    return insights;
  }, [metrics, state.plannedCampaigns, getCurrentSessionTime]);

  const getEfficiencyBadge = useCallback(() => {
    if (metrics.comparedToManual >= 80) return { label: 'Expert', color: 'bg-green-500' };
    if (metrics.comparedToManual >= 60) return { label: 'Avançado', color: 'bg-blue-500' };
    if (metrics.comparedToManual >= 40) return { label: 'Intermediário', color: 'bg-yellow-500' };
    if (metrics.comparedToManual >= 20) return { label: 'Iniciante', color: 'bg-orange-500' };
    return { label: 'Aprendendo', color: 'bg-gray-500' };
  }, [metrics.comparedToManual]);

  // Auto-start session when component mounts and there's activity
  useEffect(() => {
    const hasActivity = Object.keys(state.plannedCampaigns).length > 0;
    if (hasActivity && !metrics.currentSession) {
      startSession('optimization');
    }
  }, [state.plannedCampaigns, metrics.currentSession, startSession]);

  return {
    metrics,
    startSession,
    endSession,
    trackAction,
    getCurrentSessionTime,
    getProductivityInsights,
    getEfficiencyBadge
  };
}