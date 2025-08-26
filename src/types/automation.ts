// ============= Automation System Types =============

export interface AutomationTrigger {
  id: string;
  type: 'contact_import' | 'list_entry' | 'contact_created' | 'contact_updated' | 
        'tag_added' | 'tag_removed' | 'automation_chain' | 'specific_date' | 
        'anniversary' | 'system_event' | 'campaign_engagement' | 'external_event';
  label: string;
  description: string;
  icon: string;
  category: 'contact' | 'engagement' | 'system' | 'external';
  entryOptions: {
    frequency: 'once' | 'cooldown' | 'multiple';
    cooldownPeriod?: number; // em horas
  };
  config: Record<string, any>;
}

export interface AutomationAction {
  id: string;
  type: 'send_email' | 'wait_time' | 'pause_until' | 'add_tag' | 'remove_tag' |
        'move_list' | 'update_contact' | 'notify_admin' | 'split_ab' | 
        'conditional' | 'resend_unopened' | 'multichannel' | 'route_pool';
  label: string;
  description: string;
  icon: string;
  category: 'email' | 'timing' | 'contact' | 'advanced' | 'admin' | 'multichannel';
  config: Record<string, any>;
  limits?: {
    maxWaitDays?: number;
    maxSplitPaths?: number;
    maxConditionLevels?: number;
  };
}

export interface HeatSegment {
  id: string;
  name: string;
  description: string;
  type: 'active_7d' | 'active_30d' | 'inactive_90d' | 'dormant_180d';
  criteria: {
    engagementPeriod: number; // em dias
    minEngagementScore: number;
    maxEngagementScore: number;
  };
  color: string;
  icon: string;
  estimatedSize: number;
}

export interface AutomationFilter {
  id: string;
  type: 'email_provider' | 'lists' | 'tags' | 'custom_fields' | 
        'engagement_score' | 'heat_segment' | 'blacklist_domains' | 'blocked_contacts';
  label: string;
  description: string;
  category: 'basic' | 'engagement' | 'security';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list' | 'not_in_list';
  value: any;
  isNegative?: boolean;
}

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'filter';
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
    kpis?: AutomationKPIs;
  };
  sourceId?: string; // Para conexões
  targetIds?: string[]; // Múltiplas saídas (splits)
}

export interface AutomationKPIs {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  spam: number;
  conversion: number;
  revenue: number;
  epc: number; // Earnings per click
  rpm: number; // Revenue per mille
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  bounceRate: number;
  spamRate: number;
  conversionRate: number;
}

export interface AutomationFlow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: string;
  totalContacts: number;
  totalSends: number;
  successRate: number;
  lastActivity?: string;
  totalRevenue: number;
  epcAccumulated: number;
  nodes: AutomationNode[];
  connections: AutomationConnection[];
  settings: AutomationSettings;
  analytics: AutomationAnalytics;
}

export interface AutomationConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string; // Para splits múltiplos
  targetHandle?: string;
  condition?: string;
  label?: string;
}

export interface AutomationSettings {
  maxNodes: number;
  maxWaitDays: number;
  allowLoops: boolean;
  trackingEnabled: boolean;
  timezone: string;
  defaultSender: string;
  deliveryPool: string;
  enableRealTimeValidation: boolean;
}

export interface AutomationAnalytics {
  totalExecutions: number;
  avgExecutionTime: number;
  peakPerformanceHour: number;
  topPerformingPath: string;
  bottleneckNode?: string;
  revenueByPath: Record<string, number>;
  conversionFunnel: {
    nodeId: string;
    conversionRate: number;
    dropoffRate: number;
  }[];
}

export interface AutomationAlert {
  id: string;
  type: 'bounce_rate' | 'spam_rate' | 'critical_error' | 'low_delivery' | 'high_unsubscribe';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  automationId: string;
  nodeId?: string;
  triggeredAt: string;
  threshold: number;
  currentValue: number;
  acknowledged: boolean;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'welcome' | 'nurturing' | 'reengagement' | 'winback' | 'promotional' | 'transactional';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedSetupTime: number; // em minutos
  expectedResults: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    expectedRevenue: number;
  };
  nodes: AutomationNode[];
  connections: AutomationConnection[];
  requiredTags: string[];
  requiredLists: string[];
  previewImage?: string;
}

export interface AutomationVersionHistory {
  version: string;
  date: string;
  changes: string;
  changedBy: string;
  isActive: boolean;
  backupData: {
    nodes: AutomationNode[];
    connections: AutomationConnection[];
    settings: AutomationSettings;
  };
}

export interface AutomationValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  nodeId: string;
  type: 'infinite_loop' | 'missing_connection' | 'invalid_config' | 'exceeded_limits';
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  nodeId: string;
  type: 'performance' | 'best_practice' | 'compatibility';
  message: string;
  recommendation: string;
}

export interface ValidationSuggestion {
  nodeId?: string;
  type: 'optimization' | 'enhancement' | 'alternative';
  message: string;
  actionLabel: string;
  actionType: 'add_node' | 'modify_config' | 'change_connection';
}

// Constants for drag-and-drop
export const NODE_TYPES = {
  TRIGGER: 'trigger',
  ACTION: 'action', 
  CONDITION: 'condition',
  FILTER: 'filter'
} as const;

export const NODE_CATEGORIES = {
  TRIGGER: {
    CONTACT: 'contact',
    ENGAGEMENT: 'engagement', 
    SYSTEM: 'system',
    EXTERNAL: 'external'
  },
  ACTION: {
    EMAIL: 'email',
    TIMING: 'timing',
    CONTACT: 'contact', 
    ADVANCED: 'advanced',
    ADMIN: 'admin',
    MULTICHANNEL: 'multichannel'
  }
} as const;

export const HEAT_SEGMENT_TYPES = {
  ACTIVE_7D: 'active_7d',
  ACTIVE_30D: 'active_30d', 
  INACTIVE_90D: 'inactive_90d',
  DORMANT_180D: 'dormant_180d'
} as const;

export const AUTOMATION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  DRAFT: 'draft', 
  ARCHIVED: 'archived'
} as const;