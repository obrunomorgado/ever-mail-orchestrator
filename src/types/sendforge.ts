export interface IPPool {
  id: string;
  name: string;
  type: 'warmup' | 'staging' | 'production' | 'quarantine';
  ips: string[];
  capacity: number;
  currentUsage: number;
  usagePercent: number;
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface DomainWarmup {
  id: string;
  domain: string;
  provider: string;
  status: 'healthy' | 'warning' | 'critical';
  phase: number; // 1-30 days
  currentVolume: number;
  targetVolume: number;
  progress: number; // 0-100
  useRealLinks: boolean;
  templates: string[];
  lastActivity: string;
  reputation: {
    spamRate: number;
    bounceRate: number;
    openRate: number;
    replyRate: number;
  };
}

export interface EngagementMetrics {
  opens: {
    total: number;
    rate: number;
    trend: number;
  };
  replies: {
    total: number;
    ai: number;
    human: number;
    aiPercentage: number;
    humanPercentage: number;
  };
  spam: {
    complaints: number;
    rate: number;
    trend: number;
  };
  clicks: {
    total: number;
    rate: number;
    trend: number;
  };
}

export interface KPIMetrics {
  hardBounceRate: number;
  softBounceRate: number;
  spamComplaintRate: number;
  gmailPostmasterScore: number;
  deliverabilityScore: number;
  reputationTrend: 'up' | 'down' | 'stable';
}

export interface AlertThreshold {
  metric: string;
  threshold: number;
  currentValue: number;
  status: 'normal' | 'warning' | 'critical';
  action: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'auto' | 'manual';
  action: string;
  target: string;
  reason: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface LoadBalanceConfig {
  totalDailyVolume: number;
  domainsCount: number;
  volumePerDomain: number;
  throttlingEnabled: boolean;
  randomPacingEnabled: boolean;
  hourlyLimit: number;
  distributionStrategy: 'even' | 'weighted' | 'capacity-based';
}

export interface UsageMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  pricing: string;
  setup: string;
  status: 'active' | 'available' | 'coming-soon';
}

export interface ReplyExample {
  id: string;
  originalSubject: string;
  reply: string;
  type: 'ai' | 'human';
  timestamp: string;
  engagement: number;
  domain: string;
}

export interface SendForgeState {
  ipPools: IPPool[];
  domains: DomainWarmup[];
  engagement: EngagementMetrics;
  kpis: KPIMetrics;
  alerts: AlertThreshold[];
  activityLog: ActivityLog[];
  loadBalance: LoadBalanceConfig;
  usageModes: UsageMode[];
  replyExamples: ReplyExample[];
}