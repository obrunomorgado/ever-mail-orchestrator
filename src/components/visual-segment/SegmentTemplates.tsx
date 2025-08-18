import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Clock, TrendingDown, Zap, Target, AlertTriangle } from 'lucide-react';

const segmentTemplates = [
  {
    id: 'vip-30d',
    name: 'VIP • Engajamento Máximo',
    description: '≥ 10 aberturas E ≥ 3 cliques nos últimos 30 dias',
    estimatedSize: 120000,
    icon: Crown,
    color: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20',
    badgeColor: 'bg-yellow-400 text-yellow-900',
    category: 'Alto Valor',
    criteria: [
      { field: 'opens_30d', operator: '≥', value: '10' },
      { field: 'clicks_30d', operator: '≥', value: '3' }
    ]
  },
  {
    id: 'newcomers',
    name: 'Recém-chegados Ativos',
    description: 'Cadastrados há ≤ 30 dias E ≥ 3 aberturas',
    estimatedSize: 45000,
    icon: Users,
    color: 'border-green-400 bg-green-50 dark:bg-green-950/20',
    badgeColor: 'bg-green-400 text-green-900',
    category: 'Novos',
    criteria: [
      { field: 'signup_date', operator: '≤', value: '30' },
      { field: 'opens_30d', operator: '≥', value: '3' }
    ]
  },
  {
    id: 'warm',
    name: 'Moderadamente Engajados',
    description: '5-9 aberturas E 1-2 cliques nos últimos 60 dias',
    estimatedSize: 250000,
    icon: Target,
    color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/20',
    badgeColor: 'bg-blue-400 text-blue-900',
    category: 'Médio',
    criteria: [
      { field: 'opens_60d', operator: 'entre', value: '5-9' },
      { field: 'clicks_60d', operator: 'entre', value: '1-2' }
    ]
  },
  {
    id: 'almost-inactive',
    name: 'Quase Inativos',
    description: 'Última abertura há 30-60 dias, histórico de engajamento',
    estimatedSize: 180000,
    icon: Clock,
    color: 'border-orange-400 bg-orange-50 dark:bg-orange-950/20',
    badgeColor: 'bg-orange-400 text-orange-900',
    category: 'Atenção',
    criteria: [
      { field: 'last_open', operator: 'entre', value: '30-60' },
      { field: 'opens_total', operator: '≥', value: '10' }
    ]
  },
  {
    id: 'spam-risk',
    name: 'Prob. Spam / Bounce',
    description: '0 aberturas em 90 dias OU múltiplos bounces',
    estimatedSize: 95000,
    icon: AlertTriangle,
    color: 'border-red-400 bg-red-50 dark:bg-red-950/20',
    badgeColor: 'bg-red-400 text-red-900',
    category: 'Risco',
    criteria: [
      { field: 'opens_90d', operator: '=', value: '0' }
    ]
  },
  {
    id: 'high-value',
    name: 'Alto Valor Financeiro',
    description: 'Score engajamento ≥ 80 E interesse em investimentos',
    estimatedSize: 85000,
    icon: Crown,
    color: 'border-purple-400 bg-purple-50 dark:bg-purple-950/20',
    badgeColor: 'bg-purple-400 text-purple-900',
    category: 'Premium',
    criteria: [
      { field: 'engagement_score', operator: '≥', value: '80' },
      { field: 'has_tag', operator: 'possui', value: 'investimentos' }
    ]
  }
];

const categories = [
  { id: 'all', name: 'Todos', color: 'text-foreground' },
  { id: 'Alto Valor', name: 'Alto Valor', color: 'text-yellow-600' },
  { id: 'Novos', name: 'Novos', color: 'text-green-600' },
  { id: 'Médio', name: 'Médio', color: 'text-blue-600' },
  { id: 'Atenção', name: 'Atenção', color: 'text-orange-600' },
  { id: 'Risco', name: 'Risco', color: 'text-red-600' },
  { id: 'Premium', name: 'Premium', color: 'text-purple-600' }
];

interface SegmentTemplatesProps {
  onApplyTemplate: (template: any) => void;
}

export function SegmentTemplates({ onApplyTemplate }: SegmentTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? segmentTemplates 
    : segmentTemplates.filter(t => t.category === selectedCategory);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Templates Prontos
          </CardTitle>
          <div className="flex gap-1 flex-wrap">
            {categories.map(category => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => {
            const Icon = template.icon;
            return (
              <Card 
                key={template.id} 
                className={`${template.color} border-2 hover:shadow-md transition-all cursor-pointer group`}
                onClick={() => onApplyTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <div>
                        <h4 className="font-semibold text-sm">{template.name}</h4>
                        <Badge className={`${template.badgeColor} text-xs mt-1`}>
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      ≈ {template.estimatedSize.toLocaleString()} contatos
                    </Badge>
                    <Button 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum template encontrado para a categoria selecionada.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}