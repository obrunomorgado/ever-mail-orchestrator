import { 
  Pool, 
  TacticalSegment, 
  DispatchTemplate, 
  TacticalPlan, 
  WeeklyCoverageData,
  TacticalSlot,
  OverlapMatrix 
} from '@/types/scheduler';

export const mockPools: Pool[] = [
  {
    id: 'pool-a',
    name: 'Pool A',
    capacity: 50000,
    currentUsage: 32000,
    color: 'hsl(var(--success))',
    priority: 1
  },
  {
    id: 'pool-b',
    name: 'Pool B',
    capacity: 30000,
    currentUsage: 18000,
    color: 'hsl(var(--info))',
    priority: 2
  },
  {
    id: 'pool-c',
    name: 'Pool C',
    capacity: 20000,
    currentUsage: 5000,
    color: 'hsl(var(--warning))',
    priority: 3
  }
];

export const mockTacticalSegments: TacticalSegment[] = [
  {
    id: 'seg-vip-ativos',
    name: 'VIP Ativos',
    size: 8500,
    health: 'healthy',
    metrics: {
      expectedSends: 8500,
      interpolated: 500,
      outOfBase: 200,
      weeklyCoverage: 12
    },
    lastUsed: '2024-11-20',
    tags: ['high-value', 'engaged']
  },
  {
    id: 'seg-black-friday',
    name: 'Black Friday Clickers',
    size: 12300,
    health: 'fatigued',
    metrics: {
      expectedSends: 12300,
      interpolated: 800,
      outOfBase: 350,
      weeklyCoverage: 18
    },
    lastUsed: '2024-11-21',
    tags: ['promo', 'active']
  },
  {
    id: 'seg-newsletter',
    name: 'Newsletter Assinantes',
    size: 45600,
    health: 'healthy',
    metrics: {
      expectedSends: 45600,
      interpolated: 2100,
      outOfBase: 890,
      weeklyCoverage: 8
    },
    lastUsed: '2024-11-19',
    tags: ['newsletter', 'broad']
  },
  {
    id: 'seg-tech-lovers',
    name: 'Tech Enthusiasts',
    size: 15800,
    health: 'spam_risk',
    metrics: {
      expectedSends: 15800,
      interpolated: 1200,
      outOfBase: 600,
      weeklyCoverage: 25
    },
    lastUsed: '2024-11-18',
    tags: ['tech', 'high-engagement']
  },
  {
    id: 'seg-carrinho-abandonado',
    name: 'Carrinho Abandonado 24h',
    size: 3200,
    health: 'healthy',
    metrics: {
      expectedSends: 3200,
      interpolated: 150,
      outOfBase: 80,
      weeklyCoverage: 5
    },
    lastUsed: '2024-11-21',
    tags: ['automation', 'recovery']
  },
  {
    id: 'seg-primeiros-compradores',
    name: 'Primeiros Compradores',
    size: 6800,
    health: 'healthy',
    metrics: {
      expectedSends: 6800,
      interpolated: 200,
      outOfBase: 120,
      weeklyCoverage: 7
    },
    lastUsed: '2024-11-20',
    tags: ['new-customers', 'onboarding']
  }
];

export const mockTacticalTemplates: DispatchTemplate[] = [
  {
    id: 'tpl-bf-vip',
    name: 'Black Friday VIP Exclusivo',
    subject: '🔥 VIP: Black Friday antecipado só para você!',
    preheader: 'Acesso exclusivo 24h antes. Não perca.',
    sender: {
      name: 'EverShop VIP',
      email: 'vip@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'promocional',
    lastUsed: '2024-11-20',
    score: 'star',
    metrics: {
      ctr: 4.2,
      openRate: 32.1,
      clicks: 2847,
      sent: 67821,
      predictedRevenue: 28500,
      spamRisk: 0.1
    },
    thumbnail: 'https://via.placeholder.com/200x150/10B981/ffffff?text=BF+VIP'
  },
  {
    id: 'tpl-newsletter-weekly',
    name: 'Newsletter Semanal Moderna',
    subject: 'Sua dose semanal de novidades tech',
    preheader: 'As últimas tendências e lançamentos que você precisa saber.',
    sender: {
      name: 'EverShop News',
      email: 'newsletter@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'newsletter',
    lastUsed: '2024-11-18',
    score: 'star',
    metrics: {
      ctr: 3.1,
      openRate: 28.9,
      clicks: 1987,
      sent: 63234,
      predictedRevenue: 8500,
      spamRisk: 0.05
    },
    thumbnail: 'https://via.placeholder.com/200x150/FDBA74/ffffff?text=Newsletter'
  },
  {
    id: 'tpl-carrinho-urgente',
    name: 'Carrinho Abandonado Urgente',
    subject: '⏰ Últimas horas! Finalize com 15% OFF',
    preheader: 'Seus itens estão quase esgotando. Aproveite o desconto.',
    sender: {
      name: 'EverShop',
      email: 'carrinho@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'automacao',
    lastUsed: '2024-11-21',
    score: 'new',
    metrics: {
      ctr: 8.7,
      openRate: 45.3,
      clicks: 2341,
      sent: 26892,
      predictedRevenue: 15600,
      spamRisk: 0.2
    },
    thumbnail: 'https://via.placeholder.com/200x150/3B82F6/ffffff?text=Carrinho'
  },
  {
    id: 'tpl-tech-lancamento',
    name: 'Tech Lançamento Premium',
    subject: '🚀 Chegou! O gadget que você estava esperando',
    preheader: 'Pré-venda exclusiva com super desconto limitado.',
    sender: {
      name: 'EverShop Tech',
      email: 'tech@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'lancamento',
    lastUsed: '2024-11-17',
    score: 'warning',
    metrics: {
      ctr: 2.8,
      openRate: 22.4,
      clicks: 1543,
      sent: 55456,
      predictedRevenue: 18900,
      spamRisk: 0.35
    },
    thumbnail: 'https://via.placeholder.com/200x150/8B5CF6/ffffff?text=Tech'
  }
];

export const mockOverlapMatrix: OverlapMatrix = {
  'seg-vip-ativos': {
    'seg-black-friday': 15,
    'seg-newsletter': 8,
    'seg-tech-lovers': 22,
    'seg-carrinho-abandonado': 5,
    'seg-primeiros-compradores': 3
  },
  'seg-black-friday': {
    'seg-vip-ativos': 15,
    'seg-newsletter': 12,
    'seg-tech-lovers': 28,
    'seg-carrinho-abandonado': 7,
    'seg-primeiros-compradores': 4
  },
  'seg-newsletter': {
    'seg-vip-ativos': 8,
    'seg-black-friday': 12,
    'seg-tech-lovers': 18,
    'seg-carrinho-abandonado': 3,
    'seg-primeiros-compradores': 6
  },
  'seg-tech-lovers': {
    'seg-vip-ativos': 22,
    'seg-black-friday': 28,
    'seg-newsletter': 18,
    'seg-carrinho-abandonado': 2,
    'seg-primeiros-compradores': 8
  },
  'seg-carrinho-abandonado': {
    'seg-vip-ativos': 5,
    'seg-black-friday': 7,
    'seg-newsletter': 3,
    'seg-tech-lovers': 2,
    'seg-primeiros-compradores': 12
  },
  'seg-primeiros-compradores': {
    'seg-vip-ativos': 3,
    'seg-black-friday': 4,
    'seg-newsletter': 6,
    'seg-tech-lovers': 8,
    'seg-carrinho-abandonado': 12
  }
};

export const mockWeeklyCoverage: WeeklyCoverageData = {
  totalBaseReached: 68.5,
  interpolationRate: 8.2,
  overlapMatrix: mockOverlapMatrix,
  baseHealth: 85.3
};

export const mockTacticalPlan: TacticalPlan = {
  id: 'plan-monday-001',
  date: '2024-11-25',
  dayOfWeek: 'Segunda-feira',
  defaultPool: 'Pool A',
  slots: {
    '06h': {
      slot: '06h',
      pool: 'Pool A',
      isActive: false
    },
    '09h': {
      slot: '09h',
      segment: mockTacticalSegments[0], // VIP Ativos
      template: mockTacticalTemplates[0], // Black Friday VIP
      pool: 'Pool A',
      customSubject: '🔥 VIP: Acesso antecipado Black Friday!',
      isActive: true
    },
    '12h': {
      slot: '12h',
      segment: mockTacticalSegments[2], // Newsletter
      template: mockTacticalTemplates[1], // Newsletter
      pool: 'Pool A',
      isActive: true
    },
    '15h': {
      slot: '15h',
      pool: 'Pool B',
      isActive: false
    },
    '18h': {
      slot: '18h',
      segment: mockTacticalSegments[4], // Carrinho Abandonado
      template: mockTacticalTemplates[2], // Carrinho Urgente
      pool: 'Pool A',
      isActive: true
    },
    '21h': {
      slot: '21h',
      pool: 'Pool A',
      isActive: false
    }
  },
  metrics: {
    totalPlannedSends: 57400,
    baseReachedPercent: 24.5,
    interpolationPercent: 8.1,
    predictedClicks: 7175,
    predictedRevenue: 52600,
    clickGoalProgress: 71.8
  },
  status: 'draft'
};

export const tacticalPlannerMockData = {
  pools: mockPools,
  segments: mockTacticalSegments,
  templates: mockTacticalTemplates,
  plan: mockTacticalPlan,
  weeklyCoverage: mockWeeklyCoverage
};