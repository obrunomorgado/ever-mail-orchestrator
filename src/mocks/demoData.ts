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
    lastUpdate: "2024-01-15",
    timeSlot: "available",
    campaignType: "newsletter" as const,
    vertical: "cartao" as const
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
    lastUpdate: "2024-01-10",
    timeSlot: "available",
    campaignType: "alerta" as const,
    vertical: "emprestimo" as const
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
    lastUpdate: "2024-01-08",
    timeSlot: "available",
    campaignType: "fechamento" as const,
    vertical: "consorcio" as const
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
    lastUpdate: "2024-01-16",
    timeSlot: "available",
    campaignType: "breaking" as const,
    vertical: "cartao" as const
  },
  {
    id: "seg_cartao_premium",
    name: "Cartão Premium",
    auto: true,
    size: 75000,
    ctr: 0.21,
    erpm: 0.28,
    rfm: "543",
    description: "Portadores de cartão premium ativo",
    tags: ["premium", "cartao"],
    lastUpdate: "2024-01-16",
    timeSlot: "available",
    campaignType: "newsletter" as const,
    vertical: "cartao" as const
  },
  {
    id: "seg_emprestimo_prospect",
    name: "Prospects Empréstimo",
    auto: false,
    size: 132000,
    ctr: 0.09,
    erpm: 0.14,
    rfm: "231",
    description: "Prospects interessados em empréstimo",
    tags: ["prospect", "emprestimo"],
    lastUpdate: "2024-01-15",
    timeSlot: "available",
    campaignType: "fechamento" as const,
    vertical: "emprestimo" as const
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

// New data for missing features
export const macros = [
  {
    id: "macro_welcome",
    name: "Boas-vindas Padrão",
    type: "template",
    category: "onboarding",
    subject: "Bem-vindo(a) à nossa comunidade!",
    content: "Olá {{first_name}},\n\nFicamos muito felizes em tê-lo(a) conosco!\n\nVocê pode esperar:\n- Conteúdo exclusivo\n- Ofertas especiais\n- Dicas valiosas\n\nAtenciosamente,\nEquipe {{company_name}}",
    variables: ["first_name", "company_name", "email"],
    lastModified: "2024-01-15",
    usage: 2847
  },
  {
    id: "macro_cart_abandon",
    name: "Carrinho Abandonado",
    type: "automation",
    category: "ecommerce",
    subject: "Você esqueceu algo no seu carrinho 🛒",
    content: "Oi {{first_name}},\n\nNotamos que você deixou alguns itens incríveis no seu carrinho:\n\n{{cart_items}}\n\nQue tal finalizar sua compra? Temos {{discount_code}} especial para você!\n\nFinalizar compra: {{checkout_url}}",
    variables: ["first_name", "cart_items", "discount_code", "checkout_url", "cart_value"],
    lastModified: "2024-01-12",
    usage: 1623
  },
  {
    id: "macro_reactivation",
    name: "Reativação 30d",
    type: "campaign",
    category: "retention",
    subject: "Sentimos sua falta! Que tal uma oferta especial?",
    content: "Olá {{first_name}},\n\nFaz um tempo que não te vemos por aqui. Para te conquistar de volta, preparamos uma oferta imperdível:\n\n🎁 {{discount_percentage}}% OFF em toda a loja\n⏰ Válido até {{expiry_date}}\n\nUsar cupom: {{coupon_code}}\n\nVolte logo! ❤️",
    variables: ["first_name", "discount_percentage", "expiry_date", "coupon_code"],
    lastModified: "2024-01-10",
    usage: 956
  }
];

export const recipes = [
  {
    id: "recipe_welcome_series",
    name: "Série de Boas-vindas (5 emails)",
    category: "onboarding",
    description: "Sequência completa para novos assinantes com conteúdo de valor e primeira conversão",
    difficulty: "Fácil",
    duration: "7 dias",
    expectedROI: "R$ 45/lead",
    tags: ["email-marketing", "automation", "conversion"],
    steps: [
      { day: 0, email: "Boas-vindas + Confirmação", ctr: 0.28 },
      { day: 1, email: "História da marca + Valores", ctr: 0.22 },
      { day: 3, email: "Produto mais vendido", ctr: 0.18 },
      { day: 5, email: "Depoimentos de clientes", ctr: 0.15 },
      { day: 7, email: "Oferta especial primeiro pedido", ctr: 0.25 }
    ],
    metrics: {
      openRate: 0.42,
      clickRate: 0.08,
      conversionRate: 0.12,
      unsubscribeRate: 0.02
    }
  },
  {
    id: "recipe_black_friday",
    name: "Black Friday Countdown",
    category: "promocional",
    description: "Campanha progressiva com urgência crescente para maximizar vendas na Black Friday",
    difficulty: "Médio",
    duration: "14 dias",
    expectedROI: "R$ 156/lead",
    tags: ["promocional", "urgencia", "ecommerce"],
    steps: [
      { day: -14, email: "Aviso: Black Friday chegando", ctr: 0.15 },
      { day: -7, email: "Prévia dos produtos em oferta", ctr: 0.22 },
      { day: -3, email: "Últimos dias para se preparar", ctr: 0.28 },
      { day: -1, email: "24h para começar!", ctr: 0.35 },
      { day: 0, email: "AGORA! Black Friday começou", ctr: 0.45 },
      { day: 1, email: "Últimas horas - ofertas acabando", ctr: 0.38 }
    ],
    metrics: {
      openRate: 0.38,
      clickRate: 0.12,
      conversionRate: 0.18,
      unsubscribeRate: 0.03
    }
  },
  {
    id: "recipe_win_back",
    name: "Reativação de Inativos",
    category: "retention",
    description: "Sequência para reativar clientes que não abrem emails há 60+ dias",
    difficulty: "Avançado",
    duration: "21 dias",
    expectedROI: "R$ 23/lead",
    tags: ["reativacao", "retention", "segmentacao"],
    steps: [
      { day: 0, email: "Sentimos sua falta - pesquisa", ctr: 0.08 },
      { day: 7, email: "Conteúdo de valor (sem venda)", ctr: 0.12 },
      { day: 14, email: "Oferta especial de retorno", ctr: 0.15 },
      { day: 21, email: "Última chance - descadastrar?", ctr: 0.18 }
    ],
    metrics: {
      openRate: 0.18,
      clickRate: 0.04,
      conversionRate: 0.06,
      unsubscribeRate: 0.15
    }
  }
];

export const backfillData = {
  sources: [
    { id: "ecommerce", name: "E-commerce Platform", records: 450000, status: "connected" },
    { id: "crm", name: "CRM System", records: 280000, status: "connected" },
    { id: "analytics", name: "Google Analytics", records: 1200000, status: "connected" },
    { id: "social", name: "Social Media APIs", records: 85000, status: "pending" }
  ],
  history: [
    { date: "2024-01-15", source: "ecommerce", records: 15000, status: "completed", duration: "2h 15m" },
    { date: "2024-01-14", source: "crm", records: 8500, status: "completed", duration: "1h 45m" },
    { date: "2024-01-13", source: "analytics", records: 125000, status: "completed", duration: "4h 30m" },
    { date: "2024-01-12", source: "social", records: 2200, status: "failed", duration: "0h 15m" }
  ]
};

export const engagementMatrix = [
  { openRate: 5, clickRate: 5, segment: "VIP Subscribers", count: 2547, color: "#16a34a", erpm: 25.40 },
  { openRate: 4, clickRate: 4, segment: "Active Readers", count: 1823, color: "#2563eb", erpm: 18.50 },
  { openRate: 5, clickRate: 3, segment: "Engaged Users", count: 1654, color: "#7c3aed", erpm: 15.20 },
  { openRate: 3, clickRate: 2, segment: "New Subscribers", count: 1432, color: "#06b6d4", erpm: 8.30 },
  { openRate: 3, clickRate: 3, segment: "Casual Readers", count: 1198, color: "#f59e0b", erpm: 12.10 },
  { openRate: 4, clickRate: 2, segment: "Warm Audience", count: 976, color: "#8b5cf6", erpm: 9.80 },
  { openRate: 2, clickRate: 2, segment: "Declining Interest", count: 823, color: "#f97316", erpm: 6.20 },
  { openRate: 2, clickRate: 1, segment: "Low Engagement", count: 745, color: "#ef4444", erpm: 3.50 },
  { openRate: 1, clickRate: 1, segment: "Inactive", count: 567, color: "#dc2626", erpm: 1.20 },
  { openRate: 1, clickRate: 2, segment: "Dormant", count: 434, color: "#6b7280", erpm: 2.10 },
  { openRate: 1, clickRate: 1, segment: "Lost Subscribers", count: 289, color: "#374151", erpm: 0.50 }
];

// Legacy RFM data for backwards compatibility
export const rfmMatrix = [
  { recency: 5, frequency: 5, monetary: 5, segment: "Champions", count: 12500, color: "#10B981" },
  { recency: 5, frequency: 4, monetary: 5, segment: "Champions", count: 8900, color: "#10B981" },
  { recency: 4, frequency: 5, monetary: 5, segment: "Champions", count: 7200, color: "#10B981" },
  { recency: 5, frequency: 5, monetary: 4, segment: "Loyal Customers", count: 15600, color: "#3B82F6" },
  { recency: 5, frequency: 4, monetary: 4, segment: "Loyal Customers", count: 11800, color: "#3B82F6" },
  { recency: 4, frequency: 5, monetary: 4, segment: "Loyal Customers", count: 9400, color: "#3B82F6" },
  { recency: 5, frequency: 3, monetary: 5, segment: "Potential Loyalists", count: 18700, color: "#8B5CF6" },
  { recency: 4, frequency: 3, monetary: 4, segment: "Potential Loyalists", count: 16200, color: "#8B5CF6" },
  { recency: 3, frequency: 3, monetary: 3, segment: "New Customers", count: 25400, color: "#06B6D4" },
  { recency: 4, frequency: 2, monetary: 3, segment: "Promising", count: 14500, color: "#84CC16" },
  { recency: 3, frequency: 2, monetary: 2, segment: "Need Attention", count: 22800, color: "#F59E0B" },
  { recency: 2, frequency: 2, monetary: 2, segment: "About to Sleep", count: 19600, color: "#F97316" },
  { recency: 2, frequency: 1, monetary: 2, segment: "At Risk", count: 28900, color: "#EF4444" },
  { recency: 1, frequency: 1, monetary: 1, segment: "Cannot Lose Them", count: 8700, color: "#DC2626" },
  { recency: 1, frequency: 2, monetary: 1, segment: "Hibernating", count: 35600, color: "#7F1D1D" },
  { recency: 1, frequency: 1, monetary: 2, segment: "Lost", count: 45200, color: "#450A0A" }
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