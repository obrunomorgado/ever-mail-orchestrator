import { SendForgeState, IPPool, DomainWarmup, EngagementMetrics, KPIMetrics, AlertThreshold, ActivityLog, LoadBalanceConfig, UsageMode, ReplyExample } from '@/types/sendforge';

export const mockIPPools: IPPool[] = [
  {
    id: 'warmup-pool',
    name: 'Warmup Pool',
    type: 'warmup',
    ips: ['192.168.1.1', '192.168.1.2', '192.168.1.3'],
    capacity: 1000,
    currentUsage: 230,
    usagePercent: 23,
    healthScore: 95,
    status: 'healthy'
  },
  {
    id: 'staging-pool',
    name: 'Staging Pool', 
    type: 'staging',
    ips: ['192.168.2.1', '192.168.2.2'],
    capacity: 5000,
    currentUsage: 1200,
    usagePercent: 24,
    healthScore: 88,
    status: 'healthy'
  },
  {
    id: 'production-pool',
    name: 'Production Pool',
    type: 'production',
    ips: ['192.168.3.1', '192.168.3.2', '192.168.3.3', '192.168.3.4'],
    capacity: 20000,
    currentUsage: 5400,
    usagePercent: 27,
    healthScore: 92,
    status: 'healthy'
  },
  {
    id: 'quarantine-pool',
    name: 'Quarantine Pool',
    type: 'quarantine',
    ips: ['192.168.4.1'],
    capacity: 100,
    currentUsage: 0,
    usagePercent: 0,
    healthScore: 45,
    status: 'critical'
  }
];

export const mockDomains: DomainWarmup[] = [
  {
    id: 'domain-1',
    domain: 'newsletter1.exemplo.com',
    provider: 'Gmail',
    status: 'healthy',
    phase: 14,
    currentVolume: 2500,
    targetVolume: 3200,
    progress: 78,
    useRealLinks: true,
    templates: ['template-1', 'template-2'],
    lastActivity: '2024-01-15T14:30:00Z',
    reputation: {
      spamRate: 0.01,
      bounceRate: 0.8,
      openRate: 24.5,
      replyRate: 3.2
    }
  },
  {
    id: 'domain-2', 
    domain: 'updates.exemplo.com',
    provider: 'Gmail',
    status: 'warning',
    phase: 7,
    currentVolume: 850,
    targetVolume: 1100,
    progress: 45,
    useRealLinks: false,
    templates: ['template-3'],
    lastActivity: '2024-01-15T12:15:00Z',
    reputation: {
      spamRate: 0.02,
      bounceRate: 1.5,
      openRate: 18.2,
      replyRate: 2.1
    }
  },
  {
    id: 'domain-3',
    domain: 'alerts.exemplo.com', 
    provider: 'Outlook',
    status: 'critical',
    phase: 3,
    currentVolume: 200,
    targetVolume: 320,
    progress: 20,
    useRealLinks: true,
    templates: ['template-4'],
    lastActivity: '2024-01-15T10:45:00Z',
    reputation: {
      spamRate: 0.04,
      bounceRate: 2.8,
      openRate: 12.1,
      replyRate: 0.8
    }
  }
];

export const mockEngagement: EngagementMetrics = {
  opens: {
    total: 8420,
    rate: 22.4,
    trend: 2.1
  },
  replies: {
    total: 312,
    ai: 218,
    human: 94,
    aiPercentage: 70,
    humanPercentage: 30
  },
  spam: {
    complaints: 8,
    rate: 0.02,
    trend: -0.01
  },
  clicks: {
    total: 1205,
    rate: 3.2,
    trend: 0.5
  }
};

export const mockKPIs: KPIMetrics = {
  hardBounceRate: 0.15,
  softBounceRate: 1.2,
  spamComplaintRate: 0.02,
  gmailPostmasterScore: 88,
  deliverabilityScore: 94.2,
  reputationTrend: 'up'
};

export const mockAlerts: AlertThreshold[] = [
  {
    metric: 'Hard Bounce Rate',
    threshold: 2.0,
    currentValue: 0.15,
    status: 'normal',
    action: 'Continue monitoring'
  },
  {
    metric: 'Spam Complaint Rate',
    threshold: 0.3,
    currentValue: 0.02,
    status: 'normal', 
    action: 'Continue monitoring'
  },
  {
    metric: 'Soft Bounce Rate',
    threshold: 5.0,
    currentValue: 1.2,
    status: 'normal',
    action: 'Continue monitoring'
  },
  {
    metric: 'Gmail Postmaster Score',
    threshold: 80,
    currentValue: 88,
    status: 'normal',
    action: 'Maintain current practices'
  }
];

export const mockActivityLog: ActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2024-01-15T14:30:00Z',
    type: 'auto',
    action: 'IP promotion',
    target: '192.168.2.1',
    reason: 'Healthy metrics for 48h',
    severity: 'info'
  },
  {
    id: 'log-2',
    timestamp: '2024-01-15T12:15:00Z',
    type: 'auto',
    action: 'Volume reduction',
    target: 'alerts.exemplo.com',
    reason: 'Bounce rate > 2%',
    severity: 'warning'
  },
  {
    id: 'log-3',
    timestamp: '2024-01-15T10:45:00Z',
    type: 'manual',
    action: 'Domain quarantine',
    target: 'spam.exemplo.com',
    reason: 'Manual review required',
    severity: 'critical'
  }
];

export const mockLoadBalance: LoadBalanceConfig = {
  totalDailyVolume: 15000,
  domainsCount: 25,
  volumePerDomain: 600,
  throttlingEnabled: true,
  randomPacingEnabled: true,
  hourlyLimit: 625,
  distributionStrategy: 'capacity-based'
};

export const mockUsageModes: UsageMode[] = [
  {
    id: 'dfy',
    name: 'Done For You',
    description: 'EverInbox provisiona e gerencia todos os domínios e IPs',
    icon: 'Zap',
    features: [
      'Domínios provisionados automaticamente',
      'IPs dedicados pré-configurados',
      'Warmup automático 0-30 dias',
      'Gerenciamento completo da reputação',
      'Suporte premium 24/7'
    ],
    pricing: 'A partir de $299/mês',
    setup: 'Configuração em 24h',
    status: 'active'
  },
  {
    id: 'pre-warmed',
    name: 'Pre-Warmed',
    description: 'Marketplace de domínios já aquecidos e prontos',
    icon: 'ShoppingCart',
    features: [
      'Domínios pré-aquecidos 30+ dias',
      'Reputação Gmail estabelecida',
      'Métricas de deliverabilidade comprovadas',
      'Transferência imediata',
      'Histórico de performance'
    ],
    pricing: '$99-$499 por domínio',
    setup: 'Pronto para uso',
    status: 'active'
  },
  {
    id: 'byo',
    name: 'Bring Your Own',
    description: 'Conecte seus domínios Gmail/Workspace existentes',
    icon: 'Link',
    features: [
      'Conecta Gmail/Google Workspace',
      'Domínios customizados próprios',
      'Análise de reputação atual',
      'Plano de aquecimento personalizado',
      'Migração assistida'
    ],
    pricing: '$49/mês por domínio',
    setup: 'Configuração guiada',
    status: 'active'
  }
];

export const mockReplyExamples: ReplyExample[] = [
  {
    id: 'reply-1',
    originalSubject: 'Dicas rápidas para hoje',
    reply: 'Ótimas dicas! A #2 foi exatamente o que eu precisava. Obrigada por compartilhar.',
    type: 'ai',
    timestamp: '2024-01-15T14:20:00Z',
    engagement: 8.5,
    domain: 'newsletter1.exemplo.com'
  },
  {
    id: 'reply-2',
    originalSubject: 'Nova estratégia testada',
    reply: 'Implementei a estratégia na minha empresa e os resultados foram surpreendentes. Mais detalhes em breve?',
    type: 'human',
    timestamp: '2024-01-15T13:45:00Z',
    engagement: 9.2,
    domain: 'updates.exemplo.com'
  },
  {
    id: 'reply-3',
    originalSubject: 'Atualização semanal',
    reply: 'Sempre aguardo essas atualizações! Muito úteis para acompanhar as tendências.',
    type: 'ai',
    timestamp: '2024-01-15T12:30:00Z',
    engagement: 7.8,
    domain: 'newsletter1.exemplo.com'
  }
];

export const mockSendForgeData: SendForgeState = {
  ipPools: mockIPPools,
  domains: mockDomains,
  engagement: mockEngagement,
  kpis: mockKPIs,
  alerts: mockAlerts,
  activityLog: mockActivityLog,
  loadBalance: mockLoadBalance,
  usageModes: mockUsageModes,
  replyExamples: mockReplyExamples
};

// Volume chart data for the last 7 days
export const volumeChartData = [
  { day: 'D-6', totalVolume: 12500, ipVolume: 480 },
  { day: 'D-5', totalVolume: 13200, ipVolume: 510 },
  { day: 'D-4', totalVolume: 13800, ipVolume: 530 },
  { day: 'D-3', totalVolume: 14100, ipVolume: 542 },
  { day: 'D-2', totalVolume: 14500, ipVolume: 558 },
  { day: 'D-1', totalVolume: 14800, ipVolume: 570 },
  { day: 'Hoje', totalVolume: 15000, ipVolume: 577 }
];