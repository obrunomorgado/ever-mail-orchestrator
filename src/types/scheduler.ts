// Tactical Planner Types
export type TacticalSlot = '06h' | '09h' | '12h' | '15h' | '18h' | '21h';

export type PoolType = 'Pool A' | 'Pool B' | 'Pool C';

export interface Pool {
  id: string;
  name: PoolType;
  capacity: number;
  currentUsage: number;
  color: string;
  priority: number;
}

export type SegmentHealth = 'healthy' | 'fatigued' | 'spam_risk';
export type TemplateScore = 'star' | 'warning' | 'new';

export interface SegmentMetrics {
  expectedSends: number;
  interpolated: number;
  outOfBase: number;
  weeklyCoverage: number;
}

export interface TacticalSegment {
  id: string;
  name: string;
  size: number;
  health: SegmentHealth;
  metrics: SegmentMetrics;
  lastUsed: string;
  tags: string[];
}

export interface DispatchTemplate {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  sender: {
    name: string;
    email: string;
  };
  htmlContent: string;
  category: string;
  lastUsed: string;
  score: TemplateScore;
  metrics: {
    ctr: number;
    openRate: number;
    clicks: number;
    sent: number;
    predictedRevenue: number;
    spamRisk: number;
  };
  thumbnail: string;
}

export interface TacticalSlotData {
  slot: TacticalSlot;
  segment?: TacticalSegment;
  template?: DispatchTemplate;
  pool: PoolType;
  customSubject?: string;
  isActive: boolean;
}

export interface WeeklyCoverageData {
  totalBaseReached: number;
  interpolationRate: number;
  overlapMatrix: OverlapMatrix;
  baseHealth: number;
}

export interface OverlapMatrix {
  [segmentId: string]: {
    [segmentId: string]: number; // percentage overlap
  };
}

export interface DayMetrics {
  totalPlannedSends: number;
  baseReachedPercent: number;
  interpolationPercent: number;
  predictedClicks: number;
  predictedRevenue: number;
  clickGoalProgress: number;
}

export interface QuickSegment {
  id: string;
  name: string;
  count: number;
  type: 'segment' | 'tag' | 'list';
  isFavorite: boolean;
  lastUsed: string;
  status: 'active' | 'cooldown' | 'frequency_cap';
  cooldownUntil?: string;
  frequencyViolation?: string;
}

export interface TacticalPlan {
  id: string;
  date: string;
  dayOfWeek: string;
  defaultPool: PoolType;
  slots: Record<TacticalSlot, TacticalSlotData>;
  metrics: DayMetrics;
  status: 'draft' | 'scheduled' | 'launched';
}

export interface ScheduledDispatch {
  id: string;
  date: string;
  timeSlot: string;
  template?: DispatchTemplate;
  segment?: QuickSegment;
  customSubject?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'error';
  predictedClicks?: number;
  predictedRevenue?: number;
  position: {
    row: number;
    col: number;
  };
}

export interface ValidationResult {
  hasErrors: boolean;
  hasWarnings: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: {
    templatesValidated: number;
    segmentsAssigned: number;
    duplicateSubjects: number;
    distinctTimeSlots: number;
    totalDispatches: number;
  };
}

export interface ValidationError {
  id: string;
  type: 'missing_template' | 'missing_segment' | 'invalid_time' | 'conflict';
  message: string;
  dispatchId: string;
}

export interface ValidationWarning {
  id: string;
  type: 'duplicate_subject' | 'low_performance' | 'cooldown_violation';
  message: string;
  dispatchId: string;
  relatedDispatches?: string[];
}

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  isAvailable: boolean;
}

// Calendar Types for Monthly View
export interface TacticalEvent {
  id: string;
  name: string;
  time: string;
  datetime: string;
  status: 'active' | 'completed' | 'draft';
  campaigns: number;
  revenue: number;
  contacts: number;
  category: string;
  segment?: TacticalSegment;
  template?: DispatchTemplate;
  pool: PoolType;
}

export interface TacticalCalendarData {
  day: Date;
  events: TacticalEvent[];
}

export interface MonthlyMetrics {
  totalEvents: number;
  totalCampaigns: number;
  totalRevenue: number;
  totalContacts: number;
  activeEvents: number;
  completedEvents: number;
  draftEvents: number;
  weeklyDistribution: {
    week: number;
    events: number;
    revenue: number;
  }[];
}

export interface TacticalPlannerState {
  selectedDate: string;
  currentPlan: TacticalPlan;
  pools: Pool[];
  segments: TacticalSegment[];
  templates: DispatchTemplate[];
  weeklyCoverage: WeeklyCoverageData;
  selectedSlot?: TacticalSlot;
  sidebarTab: 'audiences' | 'templates' | 'insights';
  draggedItem?: {
    type: 'segment' | 'template';
    data: TacticalSegment | DispatchTemplate;
  };
  // New calendar state
  calendarData: TacticalCalendarData[];
  monthlyMetrics: MonthlyMetrics;
  selectedMonth: Date;
  viewMode: 'daily' | 'monthly';
}

export interface SchedulerState {
  selectedDate: string;
  dispatches: ScheduledDispatch[];
  selectedDispatch?: ScheduledDispatch;
  validation: ValidationResult;
  draggedItem?: {
    type: 'template' | 'segment' | 'dispatch';
    data: any;
  };
  viewMode: 'timeline' | 'grid';
}