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
  metrics: {
    ctr: number;
    openRate: number;
    clicks: number;
    sent: number;
  };
  thumbnail: string;
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