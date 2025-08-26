import type { Segment, SegmentSuggestion, SegmentSource, SegmentEvent, AdvancedFilter } from "@/types/segments";

export const segmentSources: SegmentSource[] = [
  {
    id: "campaigns",
    name: "Campanhas",
    type: "campaigns",
    description: "Emails enviados manualmente",
    icon: "Mail"
  },
  {
    id: "automations", 
    name: "Automações",
    type: "automations",
    description: "Fluxos automatizados",
    icon: "Workflow"
  },
  {
    id: "lists",
    name: "Listas",
    type: "lists", 
    description: "Listas de contatos específicas",
    icon: "Users"
  },
  {
    id: "tags",
    name: "Tags",
    type: "tags",
    description: "Labels aplicadas a contatos",
    icon: "Tag"
  },
  {
    id: "forms",
    name: "Formulários",
    type: "forms",
    description: "Conversões em formulários",
    icon: "FileText"
  },
  {
    id: "integrations",
    name: "Integrações",
    type: "integrations", 
    description: "CRM e APIs externas",
    icon: "Link"
  }
];

export const segmentEvents: SegmentEvent[] = [
  // Eventos básicos
  {
    id: "opened",
    name: "Abriu email",
    category: "basic",
    description: "Contato abriu pelo menos um email",
    operators: ["≥", "≤", "="],
    valueType: "number"
  },
  {
    id: "clicked", 
    name: "Clicou em link",
    category: "basic",
    description: "Contato clicou em pelo menos um link",
    operators: ["≥", "≤", "="],
    valueType: "number"
  },
  {
    id: "delivered",
    name: "Email entregue",
    category: "basic", 
    description: "Email foi entregue com sucesso",
    operators: ["≥", "≤", "="],
    valueType: "number"
  },
  {
    id: "bounced",
    name: "Email rejeitado",
    category: "basic",
    description: "Email foi rejeitado (bounce)",
    operators: ["≥", "≤", "="],
    valueType: "number"
  },
  {
    id: "unsubscribed",
    name: "Descadastrou",
    category: "basic",
    description: "Contato se descadastrou",
    operators: ["="],
    valueType: "boolean"
  },
  
  // Eventos negativos
  {
    id: "not_opened",
    name: "Não abriu email",
    category: "negative",
    description: "Contato não abriu nenhum email no período",
    operators: ["em"],
    valueType: "number"
  },
  {
    id: "not_clicked",
    name: "Não clicou em link", 
    category: "negative",
    description: "Contato não clicou em nenhum link no período",
    operators: ["em"],
    valueType: "number"
  },
  {
    id: "not_received",
    name: "Não recebeu email",
    category: "negative",
    description: "Email não foi entregue (bloqueio recorrente)",
    operators: ["em"],
    valueType: "number"
  },
  
  // Eventos avançados
  {
    id: "last_open",
    name: "Última abertura",
    category: "advanced",
    description: "Data da última abertura de email",
    operators: ["<", ">", "entre"],
    valueType: "date"
  },
  {
    id: "last_click",
    name: "Último clique", 
    category: "advanced",
    description: "Data do último clique em link",
    operators: ["<", ">", "entre"],
    valueType: "date"
  },
  {
    id: "interaction_count",
    name: "Número de interações",
    category: "advanced",
    description: "Total de aberturas + cliques no período",
    operators: ["≥", "≤", "=", "entre"],
    valueType: "number"
  },
  {
    id: "engagement_rate",
    name: "Taxa de engajamento",
    category: "advanced",
    description: "% de engajamento individual do contato",
    operators: ["≥", "≤", "entre"],
    valueType: "number"
  },
  
  // Eventos personalizados
  {
    id: "form_conversion",
    name: "Conversão em formulário",
    category: "custom",
    description: "Preencheu quiz ou formulário específico",
    operators: ["="],
    valueType: "text"
  },
  {
    id: "page_visit",
    name: "Visita à página",
    category: "custom", 
    description: "Visitou página específica do site",
    operators: ["=", "contém"],
    valueType: "text"
  },
  {
    id: "api_event",
    name: "Evento via API",
    category: "custom",
    description: "Ação registrada via integração API",
    operators: ["=", "contém"],
    valueType: "text"
  }
];

export const advancedFilters: AdvancedFilter[] = [
  // Atributos do contato
  {
    id: "name",
    category: "attributes",
    name: "Nome",
    field: "contact.name",
    type: "text"
  },
  {
    id: "age",
    category: "attributes", 
    name: "Idade",
    field: "contact.age",
    type: "number"
  },
  {
    id: "language",
    category: "attributes",
    name: "Idioma",
    field: "contact.language", 
    type: "select",
    options: ["Português", "Inglês", "Espanhol", "Francês"]
  },
  {
    id: "gender",
    category: "attributes",
    name: "Gênero",
    field: "contact.gender",
    type: "select", 
    options: ["Masculino", "Feminino", "Outro", "Não informado"]
  },
  {
    id: "job_title",
    category: "attributes",
    name: "Cargo",
    field: "contact.jobTitle",
    type: "text"
  },
  
  // Localização
  {
    id: "city",
    category: "location",
    name: "Cidade",
    field: "contact.city",
    type: "text"
  },
  {
    id: "state",
    category: "location",
    name: "Estado",
    field: "contact.state",
    type: "select",
    options: ["SP", "RJ", "MG", "RS", "PR", "SC", "BA", "GO", "DF"]
  },
  {
    id: "country",
    category: "location", 
    name: "País",
    field: "contact.country",
    type: "select",
    options: ["Brasil", "Argentina", "Chile", "Colômbia", "México", "Estados Unidos"]
  },
  
  // Device/Cliente
  {
    id: "device_type",
    category: "device",
    name: "Tipo de dispositivo",
    field: "engagement.deviceType",
    type: "select",
    options: ["Mobile", "Desktop", "Tablet"]
  },
  {
    id: "email_client",
    category: "device",
    name: "Cliente de email", 
    field: "engagement.emailClient",
    type: "select",
    options: ["Gmail", "Outlook", "Apple Mail", "Yahoo", "Thunderbird", "Outros"]
  },
  
  // Engajamento derivado
  {
    id: "engagement_level",
    category: "engagement",
    name: "Nível de engajamento",
    field: "computed.engagementLevel",
    type: "select",
    options: ["Engaged", "Dormant", "Cold"]
  },
  {
    id: "last_interaction",
    category: "engagement",
    name: "Última interação",
    field: "computed.lastInteraction", 
    type: "date"
  }
];

export const segments: Segment[] = [
  {
    id: "seg_001",
    name: "Usuários VIP",
    description: "Contatos com alto engajamento e score superior a 70",
    sources: ["campaigns", "automations"],
    events: [
      {
        id: "engagement_rate",
        name: "Taxa de engajamento",
        category: "advanced",
        description: "% de engajamento individual do contato",
        operators: ["≥"],
        valueType: "number"
      }
    ],
    filters: [],
    cards: [
      {
        id: "card_1",
        type: "include",
        conditions: [
          {
            id: "cond_1", 
            field: "engagement_rate",
            operator: "≥",
            value: 70,
            period: 30,
            unit: "days"
          }
        ]
      }
    ],
    logic: "AND",
    size: 15420,
    estimatedSize: 15420,
    status: "active",
    type: "simple",
    score: {
      engagement: 82,
      heat: "hot",
      lastInteraction: new Date("2024-01-25"),
      totalInteractions: 45,
      predictedOpen: 0.85,
      predictedClick: 0.32
    },
    analytics: {
      performance: {
        openRate: 42.3,
        clickRate: 8.7,
        unsubscribeRate: 0.2,
        bounceRate: 1.1
      },
      evolution: [
        { date: "2024-01-01", size: 14800, engagement: 79 },
        { date: "2024-01-15", size: 15200, engagement: 81 },
        { date: "2024-01-25", size: 15420, engagement: 82 }
      ],
      demographics: {
        location: { "SP": 45, "RJ": 25, "MG": 15, "Outros": 15 },
        device: { "Mobile": 65, "Desktop": 30, "Tablet": 5 },
        provider: { "Gmail": 55, "Outlook": 25, "Yahoo": 10, "Outros": 10 }
      }
    },
    lastUpdated: new Date("2024-01-25"),
    autoUpdate: true,
    createdAt: new Date("2023-12-01"),
    createdBy: "admin"
  },
  {
    id: "seg_002", 
    name: "Dormentes - Reengajamento",
    description: "Contatos sem interação há 60+ dias",
    sources: ["campaigns"],
    events: [
      {
        id: "not_opened",
        name: "Não abriu email",
        category: "negative", 
        description: "Contato não abriu nenhum email no período",
        operators: ["em"],
        valueType: "number"
      }
    ],
    filters: [],
    cards: [
      {
        id: "card_2",
        type: "include",
        conditions: [
          {
            id: "cond_2",
            field: "not_opened", 
            operator: "em",
            value: 60,
            period: 60,
            unit: "days"
          }
        ]
      }
    ],
    logic: "AND",
    size: 8950,
    estimatedSize: 8950,
    status: "active",
    type: "simple",
    score: {
      engagement: 12,
      heat: "cold",
      lastInteraction: new Date("2023-11-20"),
      totalInteractions: 3,
      predictedOpen: 0.08,
      predictedClick: 0.01
    },
    analytics: {
      performance: {
        openRate: 8.2,
        clickRate: 0.5,
        unsubscribeRate: 0.8,
        bounceRate: 3.2
      },
      evolution: [
        { date: "2024-01-01", size: 8200, engagement: 15 },
        { date: "2024-01-15", size: 8600, engagement: 13 },
        { date: "2024-01-25", size: 8950, engagement: 12 }
      ],
      demographics: {
        location: { "SP": 35, "RJ": 20, "MG": 18, "Outros": 27 },
        device: { "Mobile": 40, "Desktop": 50, "Tablet": 10 },
        provider: { "Gmail": 45, "Outlook": 30, "Yahoo": 15, "Outros": 10 }
      }
    },
    lastUpdated: new Date("2024-01-25"),
    autoUpdate: true,
    createdAt: new Date("2023-12-15"),
    createdBy: "admin"
  },
  {
    id: "seg_003",
    name: "Gmail - Altamente Engajados",
    description: "Usuários do Gmail com score alto",
    sources: ["campaigns", "automations"],
    events: [],
    filters: [
      {
        id: "email_client",
        category: "device",
        name: "Cliente de email",
        field: "engagement.emailClient",
        type: "select",
        options: ["Gmail"]
      }
    ],
    cards: [
      {
        id: "card_3",
        type: "include", 
        conditions: [
          {
            id: "cond_3",
            field: "email_client",
            operator: "=",
            value: "Gmail"
          },
          {
            id: "cond_4",
            field: "engagement_rate",
            operator: "≥", 
            value: 50,
            period: 30,
            unit: "days"
          }
        ]
      }
    ],
    logic: "AND",
    size: 12340,
    estimatedSize: 12340,
    status: "active",
    type: "composite",
    parentSegmentId: "seg_001",
    score: {
      engagement: 76,
      heat: "hot",
      lastInteraction: new Date("2024-01-24"),
      totalInteractions: 38,
      predictedOpen: 0.78,
      predictedClick: 0.28
    },
    analytics: {
      performance: {
        openRate: 38.9,
        clickRate: 7.2,
        unsubscribeRate: 0.3,
        bounceRate: 1.5
      },
      evolution: [
        { date: "2024-01-01", size: 11800, engagement: 73 },
        { date: "2024-01-15", size: 12100, engagement: 75 },
        { date: "2024-01-25", size: 12340, engagement: 76 }
      ],
      demographics: {
        location: { "SP": 50, "RJ": 25, "MG": 12, "Outros": 13 },
        device: { "Mobile": 70, "Desktop": 25, "Tablet": 5 },
        provider: { "Gmail": 100 }
      }
    },
    lastUpdated: new Date("2024-01-25"),
    autoUpdate: true,
    createdAt: new Date("2023-12-20"),
    createdBy: "admin"
  },
  {
    id: "seg_004",
    name: "Lookalike - VIPs",
    description: "Perfis similares aos usuários VIP",
    sources: ["campaigns", "automations", "lists"],
    events: [],
    filters: [],
    cards: [],
    logic: "AND",
    size: 3280,
    estimatedSize: 3280,
    status: "processing",
    type: "lookalike",
    parentSegmentId: "seg_001",
    score: {
      engagement: 65,
      heat: "warm",
      lastInteraction: new Date("2024-01-23"),
      totalInteractions: 28,
      predictedOpen: 0.68,
      predictedClick: 0.22
    },
    lastUpdated: new Date("2024-01-25"),
    autoUpdate: true,
    createdAt: new Date("2024-01-20"),
    createdBy: "admin"
  },
  {
    id: "seg_005",
    name: "Mobile Users - São Paulo",
    description: "Usuários móveis da região de São Paulo",
    sources: ["campaigns"],
    events: [],
    filters: [
      {
        id: "device_type",
        category: "device",
        name: "Tipo de dispositivo", 
        field: "engagement.deviceType",
        type: "select",
        options: ["Mobile"]
      },
      {
        id: "state",
        category: "location",
        name: "Estado",
        field: "contact.state",
        type: "select",
        options: ["SP"]
      }
    ],
    cards: [
      {
        id: "card_5",
        type: "include",
        conditions: [
          {
            id: "cond_5",
            field: "device_type",
            operator: "=",
            value: "Mobile"
          },
          {
            id: "cond_6", 
            field: "state",
            operator: "=",
            value: "SP"
          }
        ]
      }
    ],
    logic: "AND",
    size: 22150,
    estimatedSize: 22150,
    status: "active",
    type: "simple",
    score: {
      engagement: 45,
      heat: "warm",
      lastInteraction: new Date("2024-01-24"),
      totalInteractions: 22,
      predictedOpen: 0.52,
      predictedClick: 0.18
    },
    analytics: {
      performance: {
        openRate: 28.5,
        clickRate: 4.8,
        unsubscribeRate: 0.4,
        bounceRate: 2.1
      },
      evolution: [
        { date: "2024-01-01", size: 21500, engagement: 42 },
        { date: "2024-01-15", size: 21850, engagement: 44 },
        { date: "2024-01-25", size: 22150, engagement: 45 }
      ],
      demographics: {
        location: { "SP": 100 },
        device: { "Mobile": 100 },
        provider: { "Gmail": 60, "Outlook": 20, "Yahoo": 12, "Outros": 8 }
      }
    },
    lastUpdated: new Date("2024-01-25"), 
    autoUpdate: true,
    createdAt: new Date("2024-01-10"),
    createdBy: "admin"
  }
];

export const segmentSuggestions: SegmentSuggestion[] = [
  {
    id: "sugg_001",
    type: "reengagement",
    title: "Campanha de Reengajamento", 
    description: "20% da sua base está inativa há 60+ dias. Crie um segmento para reativar estes contatos.",
    expectedSize: 8950,
    potentialImpact: "Recuperar até 15% dos contatos inativos",
    suggestedActions: [
      "Criar série de reengajamento de 3 emails",
      "Oferecer desconto exclusivo de volta",
      "Pesquisa de feedback sobre conteúdo"
    ],
    conditions: [
      {
        id: "sugg_cond_1",
        field: "not_opened",
        operator: "em",
        value: 60,
        period: 60,
        unit: "days"
      }
    ]
  },
  {
    id: "sugg_002",
    type: "vip",
    title: "Programa VIP Plus",
    description: "Identifique seus top 5% mais engajados para programa especial",
    expectedSize: 1200,
    potentialImpact: "Aumentar retenção em 25%",
    suggestedActions: [
      "Conteúdo exclusivo semanal",
      "Acesso antecipado a novidades",
      "Atendimento prioritário"
    ],
    conditions: [
      {
        id: "sugg_cond_2",
        field: "engagement_rate",
        operator: "≥",
        value: 85,
        period: 90,
        unit: "days"
      }
    ]
  },
  {
    id: "sugg_003",
    type: "lookalike",
    title: "Lookalike - Compradores Premium",
    description: "Encontre perfis similares aos seus melhores compradores",
    expectedSize: 2800,
    potentialImpact: "Aumentar conversão em 40%",
    suggestedActions: [
      "Campanha de produtos premium",
      "Ofertas personalizadas",
      "Conteúdo educacional avançado"
    ],
    conditions: [
      {
        id: "sugg_cond_3",
        field: "api_event",
        operator: "=",
        value: "purchase_premium",
        period: 180,
        unit: "days"
      }
    ]
  },
  {
    id: "sugg_004",
    type: "cleanup", 
    title: "Limpeza de Base",
    description: "Remove contatos com alta taxa de rejeição e sem engajamento",
    expectedSize: 1850,
    potentialImpact: "Melhorar deliverability em 12%",
    suggestedActions: [
      "Email de confirmação final",
      "Remoção automática após 7 dias",
      "Análise de domínios problemáticos"
    ],
    conditions: [
      {
        id: "sugg_cond_4",
        field: "bounced",
        operator: "≥",
        value: 3,
        period: 30,
        unit: "days"
      },
      {
        id: "sugg_cond_5",
        field: "not_opened",
        operator: "em", 
        value: 90,
        period: 90,
        unit: "days"
      }
    ]
  }
];