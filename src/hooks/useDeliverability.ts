import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ProtectionMetric {
  id: string;
  name: string;
  description: string;
  value: number;
  threshold: number;
  unit: string;
  status: 'ok' | 'warning' | 'critical';
  enabled: boolean;
  lastCheck: string;
  trend: 'up' | 'down' | 'stable';
}

export interface DeliverabilityState {
  spamGuard: ProtectionMetric;
  bounceGuard: ProtectionMetric;
  frequencyShield: ProtectionMetric;
  overlapShield: ProtectionMetric;
  autoOptimize: ProtectionMetric;
  isPolling: boolean;
  lastUpdate: string;
}

const STORAGE_KEY = 'deliverability_settings';
const POLLING_INTERVAL = 15 * 60 * 1000; // 15 minutes

export function useDeliverability() {
  const { toast } = useToast();
  
  const [state, setState] = useState<DeliverabilityState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaultState: DeliverabilityState = {
      spamGuard: {
        id: 'spam',
        name: 'Spam Guard',
        description: 'Monitora taxa de spam reportado por usuários (Gmail Postmaster)',
        value: 0.18,
        threshold: 0.25,
        unit: '%',
        status: 'ok',
        enabled: true,
        lastCheck: new Date().toISOString(),
        trend: 'stable'
      },
      bounceGuard: {
        id: 'bounce',
        name: 'Bounce Guard',
        description: 'Monitora hard bounces via SendGrid API',
        value: 1.5,
        threshold: 2.0,
        unit: '%',
        status: 'ok',
        enabled: true,
        lastCheck: new Date().toISOString(),
        trend: 'down'
      },
      frequencyShield: {
        id: 'frequency',
        name: 'Frequency Shield',
        description: 'Limita emails por destinatário em 24h',
        value: 1.8,
        threshold: 2.0,
        unit: 'emails/24h',
        status: 'ok',
        enabled: true,
        lastCheck: new Date().toISOString(),
        trend: 'stable'
      },
      overlapShield: {
        id: 'overlap',
        name: 'Overlap Shield',
        description: 'Detecta duplicações entre segmentos',
        value: 6.1,
        threshold: 5.0,
        unit: '% duplicados',
        status: 'warning',
        enabled: true,
        lastCheck: new Date().toISOString(),
        trend: 'up'
      },
      autoOptimize: {
        id: 'optimize',
        name: 'Best Time Auto-Optimizer',
        description: 'Otimização automática de horários baseada em ML',
        value: 11.2,
        threshold: 10.0,
        unit: '% lift médio',
        status: 'ok',
        enabled: true,
        lastCheck: new Date().toISOString(),
        trend: 'up'
      },
      isPolling: true,
      lastUpdate: new Date().toISOString()
    };

    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  });

  // Calculate overall status
  const getOverallStatus = useCallback(() => {
    const enabledMetrics = Object.values(state).filter(
      (item): item is ProtectionMetric => 
        typeof item === 'object' && 'status' in item && item.enabled
    );
    
    if (enabledMetrics.some(m => m.status === 'critical')) return 'critical';
    if (enabledMetrics.some(m => m.status === 'warning')) return 'warning';
    return 'ok';
  }, [state]);

  // Update metric threshold
  const updateThreshold = useCallback((metricId: string, threshold: number) => {
    console.log('[Deliverability] Updating threshold', { metricId, threshold });
    
    setState(prev => {
      const newState = { ...prev };
      
      if (metricId in newState) {
        const metric = newState[metricId as keyof DeliverabilityState];
        if (metric && typeof metric === 'object' && 'threshold' in metric) {
          const updatedMetric = { 
            ...metric, 
            threshold,
            status: getStatusFromValue(metric.value, threshold)
          } as ProtectionMetric;
          
          (newState as any)[metricId] = updatedMetric;
          newState.lastUpdate = new Date().toISOString();
          
          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          
          return newState;
        }
      }
      
      return prev;
    });
  }, []);

  // Toggle metric enabled state
  const toggleMetric = useCallback((metricId: string) => {
    console.log('[Deliverability] Toggling metric', { metricId });
    
    setState(prev => {
      const newState = { ...prev };
      
      if (metricId in newState) {
        const metric = newState[metricId as keyof DeliverabilityState];
        if (metric && typeof metric === 'object' && 'enabled' in metric) {
          const updatedMetric = { ...metric, enabled: !metric.enabled } as ProtectionMetric;
          (newState as any)[metricId] = updatedMetric;
          newState.lastUpdate = new Date().toISOString();
          
          // Save to localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          
          toast({
            title: `${metric.name} ${updatedMetric.enabled ? 'Ativado' : 'Desativado'}`,
            description: `Proteção ${updatedMetric.enabled ? 'ativada' : 'desativada'} com sucesso.`,
          });
          
          return newState;
        }
      }
      
      return prev;
    });
  }, [toast]);

  // Get status from value vs threshold
  const getStatusFromValue = (value: number, threshold: number): 'ok' | 'warning' | 'critical' => {
    const ratio = value / threshold;
    if (ratio >= 1.0) return 'critical';
    if (ratio >= 0.8) return 'warning';
    return 'ok';
  };

  // Simulate metric updates (polling)
  const simulateMetricUpdate = useCallback(() => {
    console.log('[Deliverability] Simulating metric update');
    
    setState(prev => {
      const newState = { ...prev };
      const metrics = ['spamGuard', 'bounceGuard', 'frequencyShield', 'overlapShield'] as const;
      
      metrics.forEach(metricKey => {
        const metric = newState[metricKey] as ProtectionMetric;
        if (!metric.enabled) return;
        
        // Add small random variation
        const variation = (Math.random() - 0.5) * 0.1;
        const newValue = Math.max(0, metric.value + variation);
        const newStatus = getStatusFromValue(newValue, metric.threshold);
        
        // Trigger alert if status changes to warning/critical
        if (metric.status === 'ok' && (newStatus === 'warning' || newStatus === 'critical')) {
          toast({
            variant: newStatus === 'critical' ? 'destructive' : 'default',
            title: `Atenção: ${metric.name}`,
            description: `Métrica ultrapassou o limite seguro: ${newValue.toFixed(2)}${metric.unit}`,
          });
        }
        
        newState[metricKey] = {
          ...metric,
          value: newValue,
          status: newStatus,
          lastCheck: new Date().toISOString(),
          trend: newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable'
        };
      });
      
      newState.lastUpdate = new Date().toISOString();
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      
      return newState;
    });
  }, [toast]);

  // Start/stop polling
  const togglePolling = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPolling: !prev.isPolling,
      lastUpdate: new Date().toISOString()
    }));
  }, []);

  // Setup polling effect
  useEffect(() => {
    if (!state.isPolling) return;
    
    const interval = setInterval(simulateMetricUpdate, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [state.isPolling, simulateMetricUpdate]);

  // Manual refresh
  const refreshMetrics = useCallback(() => {
    console.log('[Deliverability] Manual refresh triggered');
    simulateMetricUpdate();
    
    toast({
      title: 'Métricas Atualizadas',
      description: 'Dados de deliverabilidade foram atualizados com sucesso.',
    });
  }, [simulateMetricUpdate, toast]);

  return {
    state,
    overallStatus: getOverallStatus(),
    updateThreshold,
    toggleMetric,
    togglePolling,
    refreshMetrics
  };
}