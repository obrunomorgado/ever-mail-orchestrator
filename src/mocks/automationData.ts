// ============= Automation Mock Data =============

import { 
  AutomationFlow, 
  AutomationTrigger, 
  AutomationAction, 
  HeatSegment,
  AutomationTemplate,
  AutomationAlert,
  AutomationVersionHistory,
  AutomationKPIs
} from '@/types/automation';

export const mockTriggers: AutomationTrigger[] = [
  {
    id: 'trigger-contact-import',
    type: 'contact_import',
    label: 'Importação de Contatos',
    description: 'Ativa quando novos contatos são importados',
    icon: 'Upload',
    category: 'contact',
    entryOptions: { frequency: 'multiple' },
    config: { batchSize: 1000 }
  },
  {
    id: 'trigger-list-entry',
    type: 'list_entry', 
    label: 'Entrada em Lista',
    description: 'Ativa quando contato entra em lista específica',
    icon: 'UserPlus',
    category: 'contact',
    entryOptions: { frequency: 'once' },
    config: { listId: '', allowReentry: false }
  },
  {
    id: 'trigger-tag-added',
    type: 'tag_added',
    label: 'Tag Adicionada',
    description: 'Ativa quando tag específica é adicionada ao contato',
    icon: 'Tag',
    category: 'contact', 
    entryOptions: { frequency: 'cooldown', cooldownPeriod: 24 },
    config: { tagName: '', caseSensitive: false }
  },
  {
    id: 'trigger-campaign-opened',
    type: 'campaign_engagement',
    label: 'Campanha Aberta',
    description: 'Ativa quando contato abre campanha específica',
    icon: 'Mail',
    category: 'engagement',
    entryOptions: { frequency: 'once' },
    config: { campaignId: '', timeWindow: 24 }
  },
  {
    id: 'trigger-api-event',
    type: 'external_event',
    label: 'Evento Externo',
    description: 'Ativa via webhook/API (quiz, pagamento, etc)',
    icon: 'Webhook',
    category: 'external',
    entryOptions: { frequency: 'multiple' },
    config: { eventType: '', webhookUrl: '' }
  },
  {
    id: 'trigger-anniversary',
    type: 'anniversary',
    label: 'Aniversário de Data',
    description: 'Ativa em datas específicas (aniversário, cadastro, etc)',
    icon: 'Calendar',
    category: 'system',
    entryOptions: { frequency: 'multiple' },
    config: { dateField: 'birthday', daysOffset: 0 }
  }
];

export const mockActions: AutomationAction[] = [
  {
    id: 'action-send-email',
    type: 'send_email',
    label: 'Enviar Email',
    description: 'Envia email usando template SendGrid',
    icon: 'Send',
    category: 'email',
    config: { 
      templateId: '', 
      senderId: 'verified@publisher.com',
      trackOpens: true,
      trackClicks: true,
      trackUnsubscribes: true
    }
  },
  {
    id: 'action-wait-time',
    type: 'wait_time',
    label: 'Aguardar Tempo',
    description: 'Pausa o fluxo por período determinado',
    icon: 'Clock',
    category: 'timing',
    config: { waitDays: 1, waitHours: 0, waitMinutes: 0 },
    limits: { maxWaitDays: 365 }
  },
  {
    id: 'action-add-tag',
    type: 'add_tag',
    label: 'Adicionar Tag',
    description: 'Adiciona tag ao contato',
    icon: 'Plus',
    category: 'contact',
    config: { tagName: '', createIfNotExists: true }
  },
  {
    id: 'action-split-ab',
    type: 'split_ab',
    label: 'Split A/B/C',
    description: 'Divide fluxo em múltiplos caminhos',
    icon: 'GitBranch',
    category: 'advanced',
    config: { 
      paths: [
        { label: 'Variante A', percentage: 33 },
        { label: 'Variante B', percentage: 33 },
        { label: 'Controle', percentage: 34 }
      ]
    },
    limits: { maxSplitPaths: 5 }
  },
  {
    id: 'action-resend-unopened',
    type: 'resend_unopened',
    label: 'Reenvio Não-Abertos',
    description: 'Reenvia com título diferente para não-abertos',
    icon: 'RotateCcw',
    category: 'email',
    config: { 
      waitHours: 48,
      newSubject: '',
      maxResends: 1
    }
  },
  {
    id: 'action-heat-segmentation',
    type: 'conditional',
    label: 'Segmentação Heat',
    description: 'Direciona por nível de engajamento',
    icon: 'Thermometer',
    category: 'advanced',
    config: { 
      segmentType: 'heat',
      paths: ['active_7d', 'active_30d', 'inactive_90d', 'dormant_180d']
    }
  },
  {
    id: 'action-multichannel',
    type: 'multichannel',
    label: 'Multicanal',
    description: 'Envia SMS, Push, WhatsApp simultaneamente',
    icon: 'MessageSquare',
    category: 'multichannel', 
    config: {
      channels: ['sms', 'push', 'whatsapp'],
      fallbackEmail: true
    }
  }
];

export const mockHeatSegments: HeatSegment[] = [
  {
    id: 'heat-active-7d',
    name: 'Ativos 7 dias',
    description: 'Abriram/clicaram nos últimos 7 dias',
    type: 'active_7d',
    criteria: { engagementPeriod: 7, minEngagementScore: 80, maxEngagementScore: 100 },
    color: 'hsl(var(--success))',
    icon: 'Flame',
    estimatedSize: 2847
  },
  {
    id: 'heat-active-30d', 
    name: 'Ativos 30 dias',
    description: 'Engajamento moderado últimos 30 dias',
    type: 'active_30d',
    criteria: { engagementPeriod: 30, minEngagementScore: 40, maxEngagementScore: 79 },
    color: 'hsl(var(--warning))',
    icon: 'TrendingUp',
    estimatedSize: 5924
  },
  {
    id: 'heat-inactive-90d',
    name: 'Inativos 90 dias', 
    description: 'Baixo engajamento últimos 90 dias',
    type: 'inactive_90d',
    criteria: { engagementPeriod: 90, minEngagementScore: 10, maxEngagementScore: 39 },
    color: 'hsl(var(--info))',
    icon: 'TrendingDown',
    estimatedSize: 8156
  },
  {
    id: 'heat-dormant-180d',
    name: 'Dormentes 180 dias',
    description: 'Sem engajamento há mais de 180 dias',
    type: 'dormant_180d', 
    criteria: { engagementPeriod: 180, minEngagementScore: 0, maxEngagementScore: 9 },
    color: 'hsl(var(--muted-foreground))',
    icon: 'Minus',
    estimatedSize: 12304
  }
];

export const mockKPIs: AutomationKPIs = {
  sent: 45892,
  delivered: 44203,
  opened: 17681,
  clicked: 2654,
  unsubscribed: 89,
  bounced: 1689,
  spam: 23,
  conversion: 412,
  revenue: 34567.89,
  epc: 13.02,
  rpm: 753.45,
  deliveryRate: 96.32,
  openRate: 40.01,
  clickRate: 15.01,
  unsubscribeRate: 0.20,
  bounceRate: 3.68,
  spamRate: 0.05,
  conversionRate: 15.53
};

export const mockAutomationFlows: AutomationFlow[] = [
  {
    id: 'automation-welcome-series',
    name: 'Welcome Series Financeiro',
    description: 'Sequência de boas-vindas com 5 emails + segmentação Heat',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    createdBy: 'admin@publisher.com',
    version: 'v2.1',
    totalContacts: 12483,
    totalSends: 45892,
    successRate: 96.32,
    lastActivity: '2024-01-25T09:15:00Z',
    totalRevenue: 34567.89,
    epcAccumulated: 13.02,
    nodes: [
      {
        id: 'node-trigger-1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Lista "Cartão Black Friday"',
          config: { triggerType: 'list_entry', listId: 'black-friday-cards' }
        }
      },
      {
        id: 'node-heat-1', 
        type: 'action',
        position: { x: 300, y: 100 },
        data: {
          label: 'Segmentação Heat',
          config: { actionType: 'heat_segmentation' }
        }
      },
      {
        id: 'node-email-active-7d',
        type: 'action',
        position: { x: 500, y: 50 },
        data: {
          label: 'Email Alta Frequência',
          config: { templateId: 'high-freq-template', senderId: 'deals@publisher.com' },
          kpis: { ...mockKPIs, openRate: 45.2, clickRate: 8.7, conversionRate: 3.2, revenue: 8934.12 }
        }
      },
      {
        id: 'node-email-active-30d',
        type: 'action', 
        position: { x: 500, y: 150 },
        data: {
          label: 'Email Nutrição',
          config: { templateId: 'nurture-template', senderId: 'info@publisher.com' },
          kpis: { ...mockKPIs, openRate: 38.1, clickRate: 6.4, conversionRate: 2.1, revenue: 5623.45 }
        }
      },
      {
        id: 'node-email-inactive-90d',
        type: 'action',
        position: { x: 500, y: 250 },
        data: {
          label: 'Reengajamento Leve',
          config: { templateId: 'light-reengagement', senderId: 'support@publisher.com' },
          kpis: { ...mockKPIs, openRate: 22.3, clickRate: 3.1, conversionRate: 0.8, revenue: 1247.89 }
        }
      }
    ],
    connections: [
      { id: 'conn-1', sourceId: 'node-trigger-1', targetId: 'node-heat-1' },
      { id: 'conn-2', sourceId: 'node-heat-1', targetId: 'node-email-active-7d', sourceHandle: 'active_7d' },
      { id: 'conn-3', sourceId: 'node-heat-1', targetId: 'node-email-active-30d', sourceHandle: 'active_30d' },
      { id: 'conn-4', sourceId: 'node-heat-1', targetId: 'node-email-inactive-90d', sourceHandle: 'inactive_90d' }
    ],
    settings: {
      maxNodes: 50,
      maxWaitDays: 365,
      allowLoops: false,
      trackingEnabled: true,
      timezone: 'America/Sao_Paulo',
      defaultSender: 'noreply@publisher.com',
      deliveryPool: 'main-pool',
      enableRealTimeValidation: true
    },
    analytics: {
      totalExecutions: 12483,
      avgExecutionTime: 4.2,
      peakPerformanceHour: 14,
      topPerformingPath: 'active_7d',
      bottleneckNode: 'node-email-inactive-90d',
      revenueByPath: {
        'active_7d': 18934.23,
        'active_30d': 12456.78,
        'inactive_90d': 3176.88
      },
      conversionFunnel: [
        { nodeId: 'node-trigger-1', conversionRate: 100, dropoffRate: 0 },
        { nodeId: 'node-heat-1', conversionRate: 98.2, dropoffRate: 1.8 },
        { nodeId: 'node-email-active-7d', conversionRate: 45.2, dropoffRate: 54.8 },
        { nodeId: 'node-email-active-30d', conversionRate: 38.1, dropoffRate: 61.9 },
        { nodeId: 'node-email-inactive-90d', conversionRate: 22.3, dropoffRate: 77.7 }
      ]
    }
  }
];

export const mockAutomationTemplates: AutomationTemplate[] = [
  {
    id: 'template-black-friday',
    name: 'Black Friday Completo',
    description: 'Automação com segmentação Heat + múltiplos fluxos otimizados',
    category: 'promotional', 
    difficulty: 'intermediate',
    estimatedSetupTime: 45,
    expectedResults: {
      openRate: 42.5,
      clickRate: 7.8,
      conversionRate: 2.3,
      expectedRevenue: 15000
    },
    nodes: [],
    connections: [],
    requiredTags: ['black-friday-eligible'],
    requiredLists: ['subscribers-active'],
    previewImage: '/templates/black-friday-preview.png'
  },
  {
    id: 'template-welcome-finance',
    name: 'Welcome Series Financeiro',
    description: 'Sequência educativa de 7 emails para novos subscribers',
    category: 'welcome',
    difficulty: 'beginner', 
    estimatedSetupTime: 30,
    expectedResults: {
      openRate: 38.2,
      clickRate: 6.1,
      conversionRate: 1.8,
      expectedRevenue: 8500
    },
    nodes: [],
    connections: [],
    requiredTags: ['new-subscriber'],
    requiredLists: ['newsletter-main']
  },
  {
    id: 'template-winback-advanced',
    name: 'Win-back Avançado',
    description: 'Reativação de dormentes com múltiplas tentativas e multicanal',
    category: 'winback',
    difficulty: 'advanced',
    estimatedSetupTime: 60,
    expectedResults: {
      openRate: 25.7,
      clickRate: 4.2,
      conversionRate: 1.1,
      expectedRevenue: 12000
    },
    nodes: [],
    connections: [],
    requiredTags: ['dormant-180d'],
    requiredLists: []
  }
];

export const mockAutomationAlerts: AutomationAlert[] = [
  {
    id: 'alert-1',
    type: 'bounce_rate',
    severity: 'high',
    message: 'Taxa de bounce acima de 5% na automação Welcome Series',
    automationId: 'automation-welcome-series',
    nodeId: 'node-email-active-7d',
    triggeredAt: '2024-01-25T10:30:00Z',
    threshold: 5.0,
    currentValue: 6.8,
    acknowledged: false
  },
  {
    id: 'alert-2',
    type: 'spam_rate',
    severity: 'critical',
    message: 'Taxa de spam crítica detectada - ação imediata necessária',
    automationId: 'automation-welcome-series', 
    nodeId: 'node-email-active-30d',
    triggeredAt: '2024-01-25T11:15:00Z',
    threshold: 0.1,
    currentValue: 0.15,
    acknowledged: false
  },
  {
    id: 'alert-3',
    type: 'low_delivery',
    severity: 'medium',
    message: 'Taxa de entrega abaixo do esperado',
    automationId: 'automation-welcome-series',
    triggeredAt: '2024-01-25T09:45:00Z',
    threshold: 95.0,
    currentValue: 93.2,
    acknowledged: true
  }
];

export const mockVersionHistory: AutomationVersionHistory[] = [
  {
    version: 'v2.1',
    date: '2024-01-20T14:30:00Z',
    changes: 'Adicionado reenvio para não-abertos no fluxo Ativo 7d',
    changedBy: 'admin@publisher.com',
    isActive: true,
    backupData: {
      nodes: [],
      connections: [],
      settings: {
        maxNodes: 50,
        maxWaitDays: 365,
        allowLoops: false,
        trackingEnabled: true,
        timezone: 'America/Sao_Paulo',
        defaultSender: 'noreply@publisher.com',
        deliveryPool: 'main-pool',
        enableRealTimeValidation: true
      }
    }
  },
  {
    version: 'v2.0',
    date: '2024-01-15T10:00:00Z',
    changes: 'Implementada segmentação Heat com 4 caminhos dinâmicos',
    changedBy: 'manager@publisher.com',
    isActive: false,
    backupData: {
      nodes: [],
      connections: [],
      settings: {
        maxNodes: 50,
        maxWaitDays: 365,
        allowLoops: false,
        trackingEnabled: true,
        timezone: 'America/Sao_Paulo',
        defaultSender: 'noreply@publisher.com',
        deliveryPool: 'main-pool',
        enableRealTimeValidation: true
      }
    }
  },
  {
    version: 'v1.5',
    date: '2024-01-10T16:20:00Z',
    changes: 'Otimizado timing entre emails e adicionado A/B test',
    changedBy: 'specialist@publisher.com',
    isActive: false,
    backupData: {
      nodes: [],
      connections: [],
      settings: {
        maxNodes: 50,
        maxWaitDays: 365,
        allowLoops: false,
        trackingEnabled: true,
        timezone: 'America/Sao_Paulo',
        defaultSender: 'noreply@publisher.com',
        deliveryPool: 'main-pool',
        enableRealTimeValidation: true
      }
    }
  }
];