import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

console.log('[Planner] Initializing usePlannerDefaults hook');

export interface PlannerDefaults {
  dailyClickGoal: number;
  frequencyCap: number;
  coolDown: number;
  anchorTimes: string[];
  viewType: 'week' | 'month';
  currentPeriod: Date;
  historyWindow: number;
}

export interface ClickMetrics {
  date: string;
  clicks: number;
  revenue: number;
  ctr: number;
}

// Mock historical data for the last 7 days
const mockHistoricalData: ClickMetrics[] = [
  { date: '2024-01-10', clicks: 890, revenue: 2340, ctr: 0.15 },
  { date: '2024-01-11', clicks: 1120, revenue: 2890, ctr: 0.18 },
  { date: '2024-01-12', clicks: 980, revenue: 2560, ctr: 0.16 },
  { date: '2024-01-13', clicks: 1240, revenue: 3200, ctr: 0.19 },
  { date: '2024-01-14', clicks: 1090, revenue: 2750, ctr: 0.17 },
  { date: '2024-01-15', clicks: 1350, revenue: 3450, ctr: 0.21 },
  { date: '2024-01-16', clicks: 1180, revenue: 3020, ctr: 0.18 }
];

// Round up to nearest 100
const roundUpTo100 = (value: number): number => {
  return Math.ceil(value / 100) * 100;
};

// Calculate 7-day moving average for click goal
const calculateClickGoal = (historicalData: ClickMetrics[]): number => {
  console.log('[Planner] Calculating daily click goal from historical data');
  
  const totalClicks = historicalData.reduce((sum, day) => sum + day.clicks, 0);
  const avgClicks = totalClicks / historicalData.length;
  const goalClicks = roundUpTo100(avgClicks);
  
  console.log('[Planner] Daily click goal calculated:', { totalClicks, avgClicks, goalClicks });
  return goalClicks;
};

// Get anchor times ordered by historical open rates
const getAnchorTimes = (): string[] => {
  console.log('[Planner] Calculating anchor times based on historical open rates');
  
  // Mock data with open rates for different times
  const timeSlotPerformance = [
    { time: '09:00', openRate: 0.34, ctr: 0.18 },
    { time: '14:00', openRate: 0.28, ctr: 0.15 },
    { time: '20:00', openRate: 0.31, ctr: 0.16 },
    { time: '07:00', openRate: 0.22, ctr: 0.12 },
    { time: '12:00', openRate: 0.25, ctr: 0.14 },
    { time: '15:00', openRate: 0.24, ctr: 0.13 },
    { time: '18:00', openRate: 0.26, ctr: 0.14 }
  ];
  
  // Sort by open rate descending and return top 3
  const sortedTimes = timeSlotPerformance
    .sort((a, b) => b.openRate - a.openRate)
    .slice(0, 3)
    .map(slot => slot.time);
  
  console.log('[Planner] Anchor times calculated:', sortedTimes);
  return sortedTimes;
};

// Get current week start (Monday)
const getCurrentWeekStart = (): Date => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when Sunday (0)
  
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  // If today is Sunday, start next week
  if (new Date().getDay() === 0) {
    monday.setDate(monday.getDate() + 7);
  }
  
  return monday;
};

export function usePlannerDefaults() {
  const { toast } = useToast();
  const [historicalData, setHistoricalData] = useState<ClickMetrics[]>(mockHistoricalData);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate defaults based on historical data
  const defaults = useMemo<PlannerDefaults>(() => {
    console.log('[Planner] Computing default values');
    
    return {
      dailyClickGoal: calculateClickGoal(historicalData),
      frequencyCap: 2, // 2 emails per recipient per 24h
      coolDown: 3, // 3 days
      anchorTimes: getAnchorTimes(),
      viewType: 'week',
      currentPeriod: getCurrentWeekStart(),
      historyWindow: 60 // 60 days for CTR & RPM calculation
    };
  }, [historicalData]);

  // Simulate loading historical data
  useEffect(() => {
    console.log('[Planner] Loading historical data for defaults calculation');
    
    const loadData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, this would fetch from API
      setHistoricalData(mockHistoricalData);
      setIsLoading(false);
      
      console.log('[Planner] Historical data loaded successfully');
      
      toast({
        title: "Defaults Calculated",
        description: `Daily click goal: ${defaults.dailyClickGoal.toLocaleString()} clicks`,
        duration: 3000
      });
    };

    loadData();
  }, []);

  // Function to recalculate defaults with new data
  const updateHistoricalData = (newData: ClickMetrics[]) => {
    console.log('[Planner] Updating historical data');
    setHistoricalData(newData);
    
    toast({
      title: "Defaults Updated",
      description: "Click goal recalculated based on new data",
      duration: 2000
    });
  };

  // Generate initial plan based on click goal
  const generateInitialPlan = (clickGoal: number) => {
    console.log('[Planner] Generating initial plan for click goal:', clickGoal);
    
    // Distribute clicks across anchor times based on performance
    const distribution = defaults.anchorTimes.map(time => {
      // Higher performing times get more allocation
      const basePerformance = time === '09:00' ? 0.4 : time === '14:00' ? 0.35 : 0.25;
      return {
        timeSlot: time,
        targetClicks: Math.round(clickGoal * basePerformance),
        suggestedCampaigns: Math.ceil((clickGoal * basePerformance) / 300) // Assume 300 clicks per campaign
      };
    });

    console.log('[Planner] Initial plan generated:', distribution);
    return distribution;
  };

  // Validate if a time slot configuration violates rules
  const validateTimeSlot = (timeSlot: string, campaignCount: number) => {
    const violations = [];
    
    if (campaignCount > defaults.frequencyCap) {
      violations.push({
        type: 'frequency_cap',
        message: `${campaignCount} campanhas excedem o limite de ${defaults.frequencyCap}`,
        severity: 'high' as const
      });
    }

    // Check cool-down (mock validation)
    if (Math.random() > 0.8) { // 20% chance of cool-down violation
      violations.push({
        type: 'cool_down',
        message: `Possível violação de cool-down de ${defaults.coolDown} dias`,
        severity: 'medium' as const
      });
    }

    return violations;
  };

  return {
    defaults,
    historicalData,
    isLoading,
    updateHistoricalData,
    generateInitialPlan,
    validateTimeSlot,
    
    // Utility functions
    roundUpTo100,
    calculateClickGoal,
    getAnchorTimes,
    getCurrentWeekStart
  };
}