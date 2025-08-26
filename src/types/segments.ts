export interface SegmentCondition {
  id: string;
  field: string;
  operator: string;
  value: string | number;
  period?: number;
  unit?: 'days' | 'weeks' | 'months';
}

export interface SegmentCard {
  id: string;
  type: 'include' | 'amplify' | 'exclude';
  conditions: SegmentCondition[];
}

export interface SegmentSource {
  id: string;
  name: string;
  type: 'campaigns' | 'automations' | 'lists' | 'tags' | 'forms' | 'integrations';
  description: string;
  icon: string;
}

export interface SegmentEvent {
  id: string;
  name: string;
  category: 'basic' | 'negative' | 'advanced' | 'custom';
  description: string;
  operators: string[];
  valueType: 'number' | 'date' | 'boolean' | 'text';
}

export interface AdvancedFilter {
  id: string;
  category: 'attributes' | 'location' | 'device' | 'engagement';
  name: string;
  field: string;
  type: 'text' | 'select' | 'number' | 'date';
  options?: string[];
}

export interface SegmentScore {
  engagement: number;
  heat: 'hot' | 'warm' | 'cold';
  lastInteraction: Date;
  totalInteractions: number;
  predictedOpen: number;
  predictedClick: number;
}

export interface SegmentAnalytics {
  performance: {
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    bounceRate: number;
  };
  evolution: {
    date: string;
    size: number;
    engagement: number;
  }[];
  demographics: {
    location: Record<string, number>;
    device: Record<string, number>;
    provider: Record<string, number>;
  };
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  sources: string[];
  events: SegmentEvent[];
  filters: AdvancedFilter[];
  cards: SegmentCard[];
  logic: 'AND' | 'OR';
  size: number;
  estimatedSize?: number;
  status: 'active' | 'processing' | 'inactive' | 'error';
  type: 'simple' | 'composite' | 'lookalike';
  parentSegmentId?: string;
  score?: SegmentScore;
  analytics?: SegmentAnalytics;
  lastUpdated: Date;
  autoUpdate: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface SegmentComparison {
  segmentA: Segment;
  segmentB: Segment;
  overlap: {
    contacts: number;
    percentage: number;
  };
  uniqueA: number;
  uniqueB: number;
  performance: {
    openRate: { a: number; b: number; diff: number };
    clickRate: { a: number; b: number; diff: number };
  };
}

export interface SegmentSuggestion {
  id: string;
  type: 'reengagement' | 'vip' | 'lookalike' | 'cleanup';
  title: string;
  description: string;
  expectedSize: number;
  potentialImpact: string;
  suggestedActions: string[];
  conditions: SegmentCondition[];
}