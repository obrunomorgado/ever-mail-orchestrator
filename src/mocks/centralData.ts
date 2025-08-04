import { 
  Users, 
  DollarSign, 
  Mail, 
  Target,
  Activity,
  UserMinus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Copy,
  UserX,
  RefreshCw,
  Clock
} from "lucide-react";

export const centralMockData = {
  kpis: [
    {
      label: "Leads Ativos",
      value: "24.892",
      trend: 12.5,
      icon: Users
    },
    {
      label: "Receita Total",
      value: "R$ 89.240",
      trend: 8.2,
      icon: DollarSign
    },
    {
      label: "RPME",
      value: "R$ 12.45",
      trend: -3.1,
      icon: Mail
    },
    {
      label: "Entregabilidade",
      value: "94.2%",
      trend: -1.8,
      icon: Target
    },
    {
      label: "ROI por Lead",
      value: "R$ 3.58",
      trend: 15.3,
      icon: Activity
    },
    {
      label: "Unsubscribes",
      value: "234",
      trend: -12.4,
      icon: UserMinus
    }
  ],

  campaigns: [
    {
      id: "camp1",
      name: "Newsletter Semanal #234",
      sent: 18420,
      openRate: 22.4,
      clickRate: 3.8,
      roi: 145.2,
      rpme: 15.30,
      estimatedRevenue: 2840.50,
      sentAt: "2024-12-01T10:00:00Z",
      alert: false,
      hourlyPerformance: [
        { hour: "06h", clickRate: 2.1 },
        { hour: "09h", clickRate: 4.2 },
        { hour: "12h", clickRate: 5.1 },
        { hour: "15h", clickRate: 3.9 },
        { hour: "18h", clickRate: 3.2 }
      ],
      providerPerformance: [
        { provider: "Gmail", deliveryRate: 96.2 },
        { provider: "Outlook", deliveryRate: 92.8 },
        { provider: "Yahoo", deliveryRate: 89.1 },
        { provider: "Outros", deliveryRate: 85.4 }
      ]
    },
    {
      id: "camp2",
      name: "Oferta Black Friday",
      sent: 25680,
      openRate: 18.9,
      clickRate: 2.3,
      roi: 89.4,
      rpme: 8.90,
      estimatedRevenue: 1980.20,
      sentAt: "2024-11-29T14:30:00Z",
      alert: true,
      hourlyPerformance: [
        { hour: "06h", clickRate: 1.8 },
        { hour: "09h", clickRate: 2.9 },
        { hour: "12h", clickRate: 3.1 },
        { hour: "15h", clickRate: 2.8 },
        { hour: "18h", clickRate: 1.9 }
      ],
      providerPerformance: [
        { provider: "Gmail", deliveryRate: 94.1 },
        { provider: "Outlook", deliveryRate: 88.2 },
        { provider: "Yahoo", deliveryRate: 82.7 },
        { provider: "Outros", deliveryRate: 79.3 }
      ]
    },
    {
      id: "camp3",
      name: "Análise Mercado Cripto",
      sent: 12340,
      openRate: 28.7,
      clickRate: 5.2,
      roi: 198.3,
      rpme: 22.10,
      estimatedRevenue: 4590.80,
      sentAt: "2024-11-28T08:15:00Z",
      alert: false,
      hourlyPerformance: [
        { hour: "06h", clickRate: 3.2 },
        { hour: "09h", clickRate: 6.1 },
        { hour: "12h", clickRate: 7.8 },
        { hour: "15h", clickRate: 5.9 },
        { hour: "18h", clickRate: 4.1 }
      ],
      providerPerformance: [
        { provider: "Gmail", deliveryRate: 97.8 },
        { provider: "Outlook", deliveryRate: 95.1 },
        { provider: "Yahoo", deliveryRate: 91.4 },
        { provider: "Outros", deliveryRate: 88.7 }
      ]
    }
  ],

  segments: [
    {
      name: "VIP 30d",
      leads: 2847,
      lastAction: "Há 2 horas",
      clickRate: 8.4,
      revenue: 28490.50,
      valuePerLead: 10.01,
      color: "#10b981"
    },
    {
      name: "MA-2C",
      leads: 5632,
      lastAction: "Há 1 dia",
      clickRate: 4.2,
      revenue: 15680.20,
      valuePerLead: 2.78,
      color: "#3b82f6"
    },
    {
      name: "SE-90",
      leads: 8943,
      lastAction: "Há 3 dias",
      clickRate: 1.8,
      revenue: 4290.10,
      valuePerLead: 0.48,
      color: "#f59e0b"
    },
    {
      name: "Novos 7d",
      leads: 1284,
      lastAction: "Há 4 horas",
      clickRate: 6.1,
      revenue: 3840.70,
      valuePerLead: 2.99,
      color: "#8b5cf6"
    },
    {
      name: "Inativos 90d",
      leads: 6186,
      lastAction: "Há 15 dias",
      clickRate: 0.3,
      revenue: 180.50,
      valuePerLead: 0.03,
      color: "#ef4444"
    }
  ],

  deliverability: [
    {
      provider: "Gmail",
      deliveryRate: 95.8,
      bounceRate: 1.2,
      openRate: 23.4,
      complaintRate: 0.08
    },
    {
      provider: "Outlook/Hotmail",
      deliveryRate: 91.4,
      bounceRate: 2.8,
      openRate: 19.2,
      complaintRate: 0.15
    },
    {
      provider: "Yahoo",
      deliveryRate: 87.9,
      bounceRate: 4.1,
      openRate: 16.8,
      complaintRate: 0.22
    },
    {
      provider: "Apple Mail",
      deliveryRate: 94.2,
      bounceRate: 1.8,
      openRate: 21.6,
      complaintRate: 0.05
    },
    {
      provider: "Outros",
      deliveryRate: 83.1,
      bounceRate: 6.2,
      openRate: 14.3,
      complaintRate: 0.31
    }
  ],

  roiByChannel: [
    {
      channel: "Facebook Ads",
      leads: 8420,
      costPerLead: 4.20,
      revenue: 52890.40,
      roi: 149.8
    },
    {
      channel: "Google Ads",
      leads: 6180,
      costPerLead: 6.80,
      revenue: 38740.20,
      roi: 92.1
    },
    {
      channel: "Orgânico",
      leads: 4290,
      costPerLead: 0.00,
      revenue: 28490.50,
      roi: 0.0
    },
    {
      channel: "Referência",
      leads: 2840,
      costPerLead: 1.50,
      revenue: 15680.90,
      roi: 268.4
    },
    {
      channel: "YouTube",
      leads: 1820,
      costPerLead: 8.90,
      revenue: 9240.10,
      roi: -43.2
    },
    {
      channel: "LinkedIn",
      leads: 950,
      costPerLead: 12.40,
      revenue: 4890.20,
      roi: -58.5
    }
  ],

  suggestedActions: [
    {
      title: "Duplicar campanha VIP",
      description: "Campanha 'Análise Mercado Cripto' teve ROI de 198%. Replicar para outros segmentos.",
      priority: "high",
      actionLabel: "Duplicar",
      icon: Copy
    },
    {
      title: "Limpar segmento SE-90",
      description: "8.943 leads inativos há 90+ dias. Remover para melhorar entregabilidade.",
      priority: "high",
      actionLabel: "Limpar Lista",
      icon: UserX
    },
    {
      title: "Reengajar MA-2C",
      description: "5.632 leads com médio engajamento. Criar sequência de reativação.",
      priority: "medium",
      actionLabel: "Criar Sequência",
      icon: RefreshCw
    },
    {
      title: "Otimizar horário de envio",
      description: "Dados mostram melhor performance às 12h. Ajustar próximas campanhas.",
      priority: "medium",
      actionLabel: "Agendar",
      icon: Clock
    },
    {
      title: "Investigar Yahoo delivery",
      description: "Taxa de entrega no Yahoo em 87.9%. Verificar reputação do domínio.",
      priority: "low",
      actionLabel: "Investigar",
      icon: AlertTriangle
    }
  ]
};