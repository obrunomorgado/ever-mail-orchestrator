import { DispatchTemplate, QuickSegment, ScheduledDispatch } from '@/types/scheduler';

export const mockTemplates: DispatchTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Black Friday - Desconto 50%',
    subject: '🔥 Black Friday: 50% OFF em tudo!',
    preheader: 'Não perca a maior promoção do ano. Válido até 30/11.',
    sender: {
      name: 'EverShop',
      email: 'promocoes@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'promocional',
    lastUsed: '2024-11-20',
    score: 'star',
    metrics: {
      ctr: 3.2,
      openRate: 24.5,
      clicks: 1847,
      sent: 57821,
      predictedRevenue: 18560,
      spamRisk: 0.1
    },
    thumbnail: 'https://via.placeholder.com/200x150/10B981/ffffff?text=Black+Friday'
  },
  {
    id: 'tpl-2',
    name: 'Newsletter Semanal',
    subject: 'Novidades da semana: produtos em destaque',
    preheader: 'Confira as últimas tendências e ofertas especiais.',
    sender: {
      name: 'EverShop News',
      email: 'newsletter@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'newsletter',
    lastUsed: '2024-11-18',
    score: 'star',
    metrics: {
      ctr: 2.8,
      openRate: 31.2,
      clicks: 987,
      sent: 35234,
      predictedRevenue: 4235,
      spamRisk: 0.05
    },
    thumbnail: 'https://via.placeholder.com/200x150/FDBA74/ffffff?text=Newsletter'
  },
  {
    id: 'tpl-3',
    name: 'Carrinho Abandonado',
    subject: 'Esqueceu algo? Finalize sua compra com 10% OFF',
    preheader: 'Complete sua compra agora e ganhe desconto exclusivo.',
    sender: {
      name: 'EverShop',
      email: 'carrinho@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'automacao',
    lastUsed: '2024-11-19',
    score: 'new',
    metrics: {
      ctr: 8.7,
      openRate: 45.3,
      clicks: 2341,
      sent: 26892,
      predictedRevenue: 2890,
      spamRisk: 0.2
    },
    thumbnail: 'https://via.placeholder.com/200x150/3B82F6/ffffff?text=Carrinho'
  },
  {
    id: 'tpl-4',
    name: 'Produto em Estoque',
    subject: 'Voltou! O produto que você queria está disponível',
    preheader: 'Corre que está acabando novamente.',
    sender: {
      name: 'EverShop Alerts',
      email: 'estoque@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'transacional',
    lastUsed: '2024-11-17',
    score: 'warning',
    metrics: {
      ctr: 12.4,
      openRate: 67.8,
      clicks: 1543,
      sent: 12456,
      predictedRevenue: 5200,
      spamRisk: 0.3
    },
    thumbnail: 'https://via.placeholder.com/200x150/EF4444/ffffff?text=Estoque'
  },
  {
    id: 'tpl-5',
    name: 'Cyber Monday Tech',
    subject: 'Cyber Monday: Tecnologia com até 70% OFF',
    preheader: 'Smartphones, notebooks e gadgets com super desconto.',
    sender: {
      name: 'EverShop Tech',
      email: 'tech@evershop.com'
    },
    htmlContent: '<html>...</html>',
    category: 'promocional',
    lastUsed: '2024-11-21',
    score: 'star',
    metrics: {
      ctr: 4.1,
      openRate: 28.9,
      clicks: 2156,
      sent: 52643,
      predictedRevenue: 12800,
      spamRisk: 0.15
    },
    thumbnail: 'https://via.placeholder.com/200x150/8B5CF6/ffffff?text=Cyber+Monday'
  }
];

export const mockSegments: QuickSegment[] = [
  {
    id: 'seg-1',
    name: 'VIPs - Compras +R$1000',
    count: 12847,
    type: 'segment',
    isFavorite: true,
    lastUsed: '2024-11-20',
    status: 'active'
  },
  {
    id: 'seg-2',
    name: 'Carrinho Abandonado 24h',
    count: 3542,
    type: 'segment',
    isFavorite: true,
    lastUsed: '2024-11-21',
    status: 'active'
  },
  {
    id: 'seg-3',
    name: 'Interessados em Tech',
    count: 28934,
    type: 'tag',
    isFavorite: true,
    lastUsed: '2024-11-19',
    status: 'cooldown',
    cooldownUntil: '2024-11-22T10:00:00'
  },
  {
    id: 'seg-4',
    name: 'Newsletter Ativos',
    count: 156789,
    type: 'list',
    isFavorite: false,
    lastUsed: '2024-11-18',
    status: 'active'
  },
  {
    id: 'seg-5',
    name: 'Black Friday Clickers',
    count: 8923,
    type: 'segment',
    isFavorite: true,
    lastUsed: '2024-11-21',
    status: 'frequency_cap',
    frequencyViolation: 'Máximo 2 emails por dia'
  },
  {
    id: 'seg-6',
    name: 'Primeiros Compradores',
    count: 4567,
    type: 'segment',
    isFavorite: false,
    lastUsed: '2024-11-15',
    status: 'active'
  }
];

export const mockDispatches: ScheduledDispatch[] = [
  {
    id: 'dispatch-1',
    date: '2024-11-22',
    timeSlot: '09:00',
    template: mockTemplates[0],
    segment: mockSegments[0],
    customSubject: '🔥 VIP Black Friday: 50% OFF exclusivo para você!',
    status: 'scheduled',
    predictedClicks: 592,
    predictedRevenue: 18560,
    position: { row: 2, col: 0 }
  },
  {
    id: 'dispatch-2',
    date: '2024-11-22',
    timeSlot: '14:00',
    template: mockTemplates[1],
    segment: mockSegments[3],
    status: 'scheduled',
    predictedClicks: 1098,
    predictedRevenue: 4235,
    position: { row: 14, col: 0 }
  },
  {
    id: 'dispatch-3',
    date: '2024-11-22',
    timeSlot: '18:30',
    template: mockTemplates[2],
    segment: mockSegments[1],
    customSubject: 'Última chance! Finalize sua compra com 15% OFF',
    status: 'draft',
    predictedClicks: 203,
    predictedRevenue: 2890,
    position: { row: 23, col: 0 }
  }
];

export const timeSlots = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30'
];

export const schedulerMockData = {
  templates: mockTemplates,
  segments: mockSegments,
  dispatches: mockDispatches,
  timeSlots
};