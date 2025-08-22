// Dados mockados conforme especificação

export const thresholds = {
  spam_ppm: 0.02,
  bounce_pct: 2.0, 
  hard_bounce_pct: 0.3,
  fivexx_pct: 1.0,
  open_unique_pct: 15.0
};

export const providerShare30d = [
  { provider: "Gmail", share: 0.58 },
  { provider: "Outlook", share: 0.25 },
  { provider: "Yahoo", share: 0.12 },
  { provider: "Outros", share: 0.05 }
];

export const dailyPlan14d = [
  { day: 1, cap: 200 }, { day: 2, cap: 250 }, { day: 3, cap: 320 }, { day: 4, cap: 400 },
  { day: 5, cap: 520 }, { day: 6, cap: 680 }, { day: 7, cap: 850 }, { day: 8, cap: 1100 },
  { day: 9, cap: 1400 }, { day: 10, cap: 1800 }, { day: 11, cap: 2300 }, { day: 12, cap: 3000 },
  { day: 13, cap: 3900 }, { day: 14, cap: 5000 }
];

export const metrics7d = {
  Gmail: [
    {d:"D-6",spam:0.01,bounce:0.6,hard:0.09,f5xx:0.4,open:17,click:3,delivered:500},
    {d:"D-5",spam:0.01,bounce:0.7,hard:0.08,f5xx:0.5,open:16,click:3,delivered:600},
    {d:"D-4",spam:0.02,bounce:0.8,hard:0.10,f5xx:0.6,open:15,click:2,delivered:680},
    {d:"D-3",spam:0.02,bounce:0.9,hard:0.12,f5xx:0.7,open:16,click:3,delivered:850},
    {d:"D-2",spam:0.03,bounce:1.1,hard:0.20,f5xx:1.2,open:13,click:2,delivered:900}, // vira Amarelo
    {d:"D-1",spam:0.02,bounce:0.9,hard:0.15,f5xx:0.8,open:14,click:2,delivered:920},
    {d:"Hoje",spam:0.02,bounce:0.8,hard:0.12,f5xx:0.7,open:15,click:2,delivered:950}
  ],
  Outlook: [
    {d:"D-6",spam:0.01,bounce:0.5,hard:0.06,f5xx:0.3,open:18,click:3,delivered:220},
    {d:"D-5",spam:0.01,bounce:0.5,hard:0.06,f5xx:0.3,open:18,click:3,delivered:230},
    {d:"D-4",spam:0.01,bounce:0.5,hard:0.06,f5xx:0.3,open:18,click:3,delivered:240},
    {d:"D-3",spam:0.01,bounce:0.5,hard:0.06,f5xx:0.3,open:18,click:3,delivered:250},
    {d:"D-2",spam:0.01,bounce:0.5,hard:0.06,f5xx:0.3,open:18,click:3,delivered:255},
    {d:"D-1",spam:0.01,bounce:0.5,hard:0.06,f5xx:0.3,open:18,click:3,delivered:258},
    {d:"Hoje",spam:0.01,bounce:0.5,hard:0.06,f5xx:0.3,open:18,click:3,delivered:260}
  ],
  Yahoo: [
    {d:"D-6",spam:0.04,bounce:2.3,hard:0.40,f5xx:1.5,open:9,click:1,delivered:60},  // Vermelho
    {d:"D-5",spam:0.04,bounce:2.4,hard:0.41,f5xx:1.5,open:8,click:1,delivered:55},
    {d:"D-4",spam:0.04,bounce:2.5,hard:0.42,f5xx:1.6,open:8,click:1,delivered:50},
    {d:"D-3",spam:0.05,bounce:2.5,hard:0.43,f5xx:1.6,open:8,click:1,delivered:45},
    {d:"D-2",spam:0.05,bounce:2.6,hard:0.44,f5xx:1.6,open:8,click:1,delivered:42},
    {d:"D-1",spam:0.05,bounce:2.6,hard:0.45,f5xx:1.6,open:8,click:1,delivered:41},
    {d:"Hoje",spam:0.05,bounce:2.6,hard:0.45,f5xx:1.6,open:8,click:1,delivered:40}
  ],
  Outros: [
    {d:"D-6",spam:0.00,bounce:0.2,hard:0.03,f5xx:0.2,open:20,click:4,delivered:40},
    {d:"D-5",spam:0.00,bounce:0.2,hard:0.03,f5xx:0.2,open:20,click:4,delivered:42},
    {d:"D-4",spam:0.00,bounce:0.3,hard:0.03,f5xx:0.2,open:19,click:3,delivered:45},
    {d:"D-3",spam:0.00,bounce:0.3,hard:0.03,f5xx:0.2,open:19,click:3,delivered:47},
    {d:"D-2",spam:0.00,bounce:0.3,hard:0.03,f5xx:0.2,open:19,click:3,delivered:48},
    {d:"D-1",spam:0.00,bounce:0.3,hard:0.03,f5xx:0.2,open:19,click:3,delivered:49},
    {d:"Hoje",spam:0.00,bounce:0.3,hard:0.03,f5xx:0.2,open:19,click:3,delivered:50}
  ]
};

// Função para calcular estado do provedor
export const calculateProviderState = (
  spam: number, 
  bounce: number, 
  hard: number, 
  fivexx: number, 
  open: number
): "verde" | "amarelo" | "vermelho" => {
  // Vermelho se qualquer métrica crítica ultrapassar
  if (spam > thresholds.spam_ppm || 
      bounce > thresholds.bounce_pct || 
      hard > thresholds.hard_bounce_pct || 
      fivexx > thresholds.fivexx_pct || 
      open < thresholds.open_unique_pct) {
    return "vermelho";
  }
  
  // Verde se todas métricas ok
  if (spam < thresholds.spam_ppm && 
      bounce < thresholds.bounce_pct && 
      hard < thresholds.hard_bounce_pct && 
      fivexx < thresholds.fivexx_pct && 
      open >= thresholds.open_unique_pct) {
    return "verde";
  }
  
  // Amarelo caso contrário
  return "amarelo";
};

// Função para calcular novo cap baseado na saúde
export const calculateNewCap = (currentCap: number, state: "verde" | "amarelo" | "vermelho"): number => {
  const healthMultipliers = {
    verde: 1.25,    // +25%
    amarelo: 1.10,  // +10%
    vermelho: 0.70  // -30%
  };
  
  const multiplier = healthMultipliers[state];
  let newCap = Math.round(currentCap * multiplier);
  
  // Aplicar guard-rails: máx +30% e mín -50%
  const maxIncrease = Math.round(currentCap * 1.30);
  const minDecrease = Math.round(currentCap * 0.50);
  
  if (newCap > maxIncrease) newCap = maxIncrease;
  if (newCap < minDecrease) newCap = minDecrease;
  
  return newCap;
};

// Estados atuais dos provedores
export const getProviderStates = () => {
  const states: Record<string, "verde" | "amarelo" | "vermelho"> = {};
  
  Object.keys(metrics7d).forEach(provider => {
    const todayMetrics = metrics7d[provider as keyof typeof metrics7d].slice(-1)[0];
    states[provider] = calculateProviderState(
      todayMetrics.spam,
      todayMetrics.bounce,
      todayMetrics.hard,
      todayMetrics.f5xx,
      todayMetrics.open
    );
  });
  
  return states;
};

// Dados para gráfico Cap planejado vs Entregues
export const getCapChartData = () => {
  const last7Days = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Hoje"];
  const planValues = [850, 1100, 1400, 1800, 2300, 3000, 3900]; // Últimos 7 dias da rampa
  
  return last7Days.map((day, index) => {
    const totalDelivered = Object.values(metrics7d).reduce((sum, providerMetrics) => {
      const dayMetric = providerMetrics.find(m => m.d === day);
      return sum + (dayMetric?.delivered || 0);
    }, 0);
    
    return {
      day,
      planned: planValues[index],
      delivered: totalDelivered
    };
  });
};

// Templates de conteúdo conforme spec
export const contentTemplates = [
  {
    subject: "[Atualização rápida] 3 dicas que funcionaram hoje",
    preview: "Passei aqui pra compartilhar 3 ideias curtas que deram certo. Quer ver?",
    cta: "Conferir as 3 dicas"
  },
  {
    subject: "Posso te mandar só 1 coisa útil?",
    preview: "Separei um único link que vale seu clique hoje.",
    cta: "Me mostra"
  },
  {
    subject: "Uma micro-vitória por dia",
    preview: "Teste rápido, 2 minutos de leitura. Zero enrolação.",
    cta: "Ler agora"
  }
];

// Checklist diário
export const dailyChecklist = [
  "SPF/DKIM/DMARC ok",
  "Conteúdo leve",
  "Segmento correto (T1/T2)",
  "Ressência respeitada",
  "Cap por provedor aplicado"
];

// Microcopies para ações
export const actionMicrocopy = {
  avançar: "Métricas saudáveis por 2 dias. Subimos +20–25% mantendo foco em T1/T2.",
  manter: "Oscilou. Mantemos o cap e priorizamos T1.",
  recuar: "Limites ultrapassados. Reduzimos -30–50%, voltamos 2 dias na rampa e ficamos em T1.",
  pausar: "5xx/rejeições elevadas. Pausado 24–48h, retomamos com T1 pequeno.",
  dica_pauta: "Conteúdo leve, neutro, HTML simples, sem promessa agressiva."
};