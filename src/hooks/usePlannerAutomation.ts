import { useCallback, useMemo } from 'react';
import { usePlanner, CampaignSegment } from '@/contexts/PlannerContext';
import { useToast } from '@/hooks/use-toast';
import { segments, templates } from '@/mocks/demoData';

interface AutomationStats {
  totalSlots: number;
  filledSlots: number;
  automationUsage: number;
  estimatedRevenue: number;
  timeToComplete: number;
}

export function usePlannerAutomation() {
  const { state, createSlot, removeSlot, setFrequencyCap } = usePlanner();
  const { toast } = useToast();

  const generateWeekDates = useCallback(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const timeSlots = ['07:00', '09:00', '12:00', '15:00', '18:00'];
  const weekDates = generateWeekDates();

  const getAvailableSlots = useCallback(() => {
    const slots = [];
    for (const date of weekDates) {
      for (const timeSlot of timeSlots) {
        const existingCampaigns = state.plannedCampaigns[date]?.[timeSlot] || [];
        if (existingCampaigns.length === 0) {
          slots.push({ date, timeSlot });
        }
      }
    }
    return slots;
  }, [state.plannedCampaigns, weekDates]);

  const findBestTemplate = useCallback((segment: CampaignSegment) => {
    // Score templates based on segment characteristics
    return templates
      .map(template => {
        let score = template.openRate * 100 + template.clickRate * 200; // Base score from performance
        
        // Boost score based on segment-template compatibility
        const rfmScore = parseInt(segment.rfm.charAt(0)) || 1;
        if (rfmScore >= 4 && template.isFavorite) score += 20;
        if (segment.ctr >= 0.05 && template.openRate >= 0.25) score += 15;
        if (segment.size >= 50000 && template.subject.includes('Especial')) score += 10;
        
        return { ...template, compatibilityScore: score };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)[0];
  }, []);

  const autoFillBestSlots = useCallback(async () => {
    const startTime = Date.now();
    const availableSlots = getAvailableSlots();
    const sortedSegments = [...segments]
      .filter(s => s.size >= 1000) // Minimum viable audience
      .sort((a, b) => {
        const rpmA = a.erpm * 1000; // Use existing erpm (estimated revenue per mille)
        const rpmB = b.erpm * 1000;
        return rpmB - rpmA; // Highest RPM first
      });

    let filledCount = 0;
    const maxSlots = Math.min(availableSlots.length, sortedSegments.length, 20);

    for (let i = 0; i < maxSlots; i++) {
      const segment = sortedSegments[i];
      const bestTemplate = findBestTemplate(segment);
      
      // Get optimal time recommendation based on segment characteristics
      const rfmScore = parseInt(segment.rfm.charAt(0)) || 1;
      const availableSlot = availableSlots[filledCount];
      
      if (availableSlot) {
        // Simple slot selection logic - high value segments get better times
        const preferredTimes = rfmScore >= 4 ? ['09:00', '12:00', '15:00'] : ['07:00', '18:00'];
        const bestSlot = availableSlots.find(slot => preferredTimes.includes(slot.timeSlot)) || availableSlot;

        createSlot(bestSlot.date, bestSlot.timeSlot, segment.id, bestTemplate.id);
        filledCount++;
      }
    }

    const duration = Date.now() - startTime;
    toast({
      title: "Auto-preenchimento concluído",
      description: `${filledCount} slots preenchidos em ${duration}ms com base no RPM`,
      duration: 3000
    });

    return { filledCount, duration };
  }, [state, segments, getAvailableSlots, findBestTemplate, createSlot, toast]);

  const smartWeeklyPlan = useCallback(async () => {
    const startTime = Date.now();
    
    // Clear existing plans
    Object.keys(state.plannedCampaigns).forEach(date => {
      Object.keys(state.plannedCampaigns[date] || {}).forEach(timeSlot => {
        const campaigns = state.plannedCampaigns[date][timeSlot] || [];
        campaigns.forEach(campaign => {
          removeSlot(date, timeSlot, campaign.id);
        });
      });
    });

    // Set optimal frequency cap for weekly planning
    setFrequencyCap(3); // Max 3 emails per week per contact

    // Distribute segments across the week optimally
    const topSegments = [...segments]
      .filter(s => s.size >= 5000)
      .sort((a, b) => {
        const rfmA = parseInt(a.rfm.charAt(0)) || 1;
        const rfmB = parseInt(b.rfm.charAt(0)) || 1;
        return rfmB - rfmA;
      })
      .slice(0, 28); // 4 per day × 7 days

    let dayIndex = 0;
    let dailyCount = 0;
    const maxPerDay = 4;

    for (const segment of topSegments) {
      if (dailyCount >= maxPerDay) {
        dayIndex++;
        dailyCount = 0;
      }
      
      if (dayIndex >= 7) break;

      const date = weekDates[dayIndex];
      const bestTemplate = findBestTemplate(segment);
      
      // Get optimal time for this segment
      const availableTimes = timeSlots.filter(time => {
        const existing = state.plannedCampaigns[date]?.[time] || [];
        return existing.length === 0;
      });

      if (availableTimes.length > 0) {
        // Simple time selection based on segment characteristics
        const rfmScore = parseInt(segment.rfm.charAt(0)) || 1;
        const preferredTimes = rfmScore >= 4 ? ['09:00', '12:00'] : ['15:00', '18:00'];
        const timeSlot = availableTimes.find(time => preferredTimes.includes(time)) || availableTimes[0];

        createSlot(date, timeSlot, segment.id, bestTemplate.id);
        dailyCount++;
      }
    }

    const duration = Date.now() - startTime;
    toast({
      title: "Plano semanal criado",
      description: `Distribuição otimizada em ${duration}ms respeitando frequency-cap`,
      duration: 3000
    });

    return { segmentsScheduled: topSegments.length, duration };
  }, [state, segments, weekDates, removeSlot, setFrequencyCap, findBestTemplate, createSlot, toast]);

  const resolveAllConflicts = useCallback(async () => {
    const startTime = Date.now();
    let resolvedCount = 0;

    // Simple conflict resolution - check for overloaded days
    const dailyCounts = weekDates.reduce((acc, date) => {
      const daySlots = state.plannedCampaigns[date] || {};
      const campaignCount = Object.values(daySlots).reduce((total, campaigns) => total + campaigns.length, 0);
      acc[date] = campaignCount;
      return acc;
    }, {} as Record<string, number>);

    // If any day has more than 4 campaigns, try to redistribute
    for (const [date, count] of Object.entries(dailyCounts)) {
      if (Number(count) > 4) {
        const daySlots = state.plannedCampaigns[date] || {};
        const allCampaigns = Object.entries(daySlots).flatMap(([timeSlot, campaigns]) => 
          campaigns.map(campaign => ({ ...campaign, originalDate: date, originalTimeSlot: timeSlot }))
        );
        
        // Move excess campaigns to less loaded days
        const excessCampaigns = allCampaigns.slice(4);
        for (const campaign of excessCampaigns) {
          const availableSlots = getAvailableSlots();
          if (availableSlots.length > 0) {
            const newSlot = availableSlots[0];
            removeSlot(campaign.originalDate, campaign.originalTimeSlot, campaign.id);
            createSlot(newSlot.date, newSlot.timeSlot, campaign.segmentId, campaign.templateId || '');
            resolvedCount++;
          }
        }
      }
    }

    const duration = Date.now() - startTime;
    toast({
      title: "Conflitos resolvidos",
      description: `${resolvedCount} conflitos resolvidos automaticamente em ${duration}ms`,
      duration: 3000
    });

    return { resolvedCount, duration };
  }, [state, getAvailableSlots, removeSlot, createSlot, toast]);

  const getAutomationStats = useCallback((): AutomationStats => {
    const totalSlots = weekDates.length * timeSlots.length;
    const filledSlots = Object.values(state.plannedCampaigns).reduce((total, daySlots) => {
      return total + Object.values(daySlots).reduce((dayTotal, campaigns) => {
        return dayTotal + campaigns.length;
      }, 0);
    }, 0);

    const estimatedRevenue = Object.values(state.plannedCampaigns).reduce((total, daySlots) => {
      return total + Object.values(daySlots).reduce((dayTotal, campaigns) => {
        return dayTotal + campaigns.reduce((campaignTotal, campaign) => {
          return campaignTotal + campaign.estimatedRevenue;
        }, 0);
      }, 0);
    }, 0);

    return {
      totalSlots,
      filledSlots,
      automationUsage: Math.round((filledSlots / totalSlots) * 100),
      estimatedRevenue,
      timeToComplete: filledSlots * 2.5 // Estimated 2.5 min per manual slot
    };
  }, [state.plannedCampaigns, weekDates]);

  return {
    autoFillBestSlots,
    smartWeeklyPlan,
    resolveAllConflicts,
    findBestTemplate,
    getAutomationStats,
    getAvailableSlots
  };
}