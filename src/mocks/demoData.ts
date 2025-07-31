export const segments = [
  { 
    id: "seg_vip30", 
    name: "VIP 30d", 
    auto: true, 
    size: 120000, 
    ctr: 0.18, 
    erpm: 0.22, 
    rfm: "444",
    description: "Clientes VIP com compras nos últimos 30 dias",
    tags: ["vip", "alta_conversao"],
    lastUpdate: "2024-01-15"
  },
  { 
    id: "seg_ma2c", 
    name: "MA-2C", 
    auto: false, 
    size: 96000, 
    ctr: 0.13, 
    erpm: 0.16, 
    rfm: "332",
    description: "Segmento manual de reativação - 2 compras",
    tags: ["reativacao", "manual"],
    lastUpdate: "2024-01-10"
  },
  { 
    id: "seg_inativo90", 
    name: "SE-90", 
    auto: true, 
    size: 88000, 
    ctr: 0.01, 
    erpm: 0.04, 
    rfm: "111",
    description: "Segmento inativo há mais de 90 dias",
    tags: ["inativo", "recuperacao"],
    lastUpdate: "2024-01-08"
  },
  {
    id: "seg_new_buyers",
    name: "Novos Compradores",
    auto: true,
    size: 45000,
    ctr: 0.25,
    erpm: 0.31,
    rfm: "345",
    description: "Primeira compra nos últimos 14 dias",
    tags: ["novos", "onboarding"],
    lastUpdate: "2024-01-16"
  }
];

export const tags = [
  { 
    id: "tag_cliente_ativo", 
    name: "status=cliente_ativo", 
    auto: true, 
    applied: 54000,
    description: "Tag automática baseada em atividade recente",
    rule: "last_purchase <= 30 days",
    category: "status"
  },
  { 
    id: "tag_blackfriday25", 
    name: "campanha=BlackFriday25", 
    auto: false, 
    applied: 22000,
    description: "Tag manual para campanha Black Friday 2025",
    rule: "manual_selection",
    category: "campanha"
  },
  {
    id: "tag_high_value",
    name: "valor=alto",
    auto: true,
    applied: 18500,
    description: "Clientes com ticket médio > R$ 500",
    rule: "avg_order_value > 500",
    category: "valor"
  }
];

export const lists = [
  { 
    id: "list_quiz_cartao", 
    name: "Quiz Cartões", 
    auto: false, 
    origin: "Facebook", 
    size: 220000,
    description: "Lista gerada através do quiz de cartões no Facebook",
    quality: "high",
    lastImport: "2024-01-14"
  },
  { 
    id: "auto_list_fb_jul25", 
    name: "FB Ads Jul/25", 
    auto: true, 
    origin: "Facebook", 
    size: 48000,
    description: "Lista automática de leads do Facebook Ads",
    quality: "medium",
    lastImport: "2024-01-16"
  },
  {
    id: "list_newsletter",
    name: "Newsletter Subscribers",
    auto: true,
    origin: "Website",
    size: 125000,
    description: "Assinantes da newsletter principal",
    quality: "high",
    lastImport: "2024-01-16"
  }
];

export const heatMapData = Array.from({ length: 24 }, (_, hour) =>
  Array.from({ length: 7 }, (_, day) => ({
    hour,
    day,
    erpm: Math.random() * 0.4 + 0.1, // 0.1 to 0.5
    openRate: Math.random() * 0.3 + 0.15, // 15% to 45%
    clickRate: Math.random() * 0.08 + 0.02, // 2% to 10%
    volume: Math.floor(Math.random() * 50000) + 5000
  }))
).flat();

export const automationNodes = [
  {
    id: 'trigger',
    type: 'input',
    position: { x: 50, y: 100 },
    data: { 
      label: 'Trigger: New Subscriber',
      type: 'trigger',
      config: {
        event: 'user_subscribed',
        conditions: ['email_verified']
      }
    }
  },
  {
    id: 'split',
    type: 'default',
    position: { x: 250, y: 100 },
    data: { 
      label: 'A/B Split Test',
      type: 'split',
      config: {
        splitType: 'ab_test',
        ratioA: 50,
        ratioB: 50
      }
    }
  },
  {
    id: 'email_a',
    type: 'default',
    position: { x: 450, y: 50 },
    data: { 
      label: 'Email A: Welcome',
      type: 'email',
      config: {
        template: 'welcome_v1',
        subject: 'Bem-vindo!',
        delay: '0h'
      }
    }
  },
  {
    id: 'email_b',
    type: 'default',
    position: { x: 450, y: 150 },
    data: { 
      label: 'Email B: Welcome + Discount',
      type: 'email',
      config: {
        template: 'welcome_v2',
        subject: 'Bem-vindo! 10% OFF',
        delay: '0h'
      }
    }
  },
  {
    id: 'revenue',
    type: 'output',
    position: { x: 650, y: 100 },
    data: { 
      label: 'Meta: Receita R$ 12.5k',
      type: 'goal',
      config: {
        metric: 'revenue',
        target: 12500,
        timeframe: '30d'
      }
    }
  }
];

export const automationEdges = [
  { id: 'trigger-split', source: 'trigger', target: 'split' },
  { id: 'split-emaila', source: 'split', target: 'email_a', label: '50%' },
  { id: 'split-emailb', source: 'split', target: 'email_b', label: '50%' },
  { id: 'emaila-revenue', source: 'email_a', target: 'revenue' },
  { id: 'emailb-revenue', source: 'email_b', target: 'revenue' }
];

export const warmupSchedule = [
  { day: 1, volume: 50, reputation: 0.1, notes: "Início cauteloso" },
  { day: 2, volume: 100, reputation: 0.2, notes: "Aumento gradual" },
  { day: 3, volume: 200, reputation: 0.35, notes: "Construindo confiança" },
  { day: 7, volume: 500, reputation: 0.6, notes: "Primeira semana completa" },
  { day: 14, volume: 1000, reputation: 0.8, notes: "Duas semanas estáveis" },
  { day: 21, volume: 2000, reputation: 0.9, notes: "Quase na capacidade total" },
  { day: 30, volume: 5000, reputation: 0.95, notes: "Warm-up concluído" }
];

export const guardrailsData = {
  spamRate: 0.04,
  bounceRate: 0.02,
  unsubscribeRate: 0.01,
  thresholds: {
    spam: 0.05,
    bounce: 0.03,
    unsubscribe: 0.02
  }
};