import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Filter, Users, Clock, BarChart, Zap, Search } from 'lucide-react';

const fieldCategories = [
  {
    id: 'engagement',
    name: 'Engajamento',
    icon: Target,
    color: 'text-success',
    fields: [
      { id: 'opens_7d', label: 'Aberturas 7d', example: '≥ 5' },
      { id: 'opens_30d', label: 'Aberturas 30d', example: '≥ 10' },
      { id: 'opens_60d', label: 'Aberturas 60d', example: '≥ 15' },
      { id: 'opens_90d', label: 'Aberturas 90d', example: '≥ 20' },
      { id: 'clicks_7d', label: 'Cliques 7d', example: '≥ 2' },
      { id: 'clicks_30d', label: 'Cliques 30d', example: '≥ 3' },
      { id: 'clicks_60d', label: 'Cliques 60d', example: '≥ 5' },
      { id: 'clicks_90d', label: 'Cliques 90d', example: '≥ 8' },
      { id: 'open_rate', label: '% Abertura', example: '≥ 25%' },
      { id: 'click_rate', label: '% Clique', example: '≥ 5%' },
      { id: 'last_open', label: 'Última abertura', example: '≤ 7 dias' },
      { id: 'last_click', label: 'Último clique', example: '≤ 30 dias' }
    ]
  },
  {
    id: 'origin',
    name: 'Origem & Tech',
    icon: Filter,
    color: 'text-info',
    fields: [
      { id: 'provider', label: 'Provedor', example: 'Gmail' },
      { id: 'domain', label: 'Domínio', example: '@empresa.com' },
      { id: 'device', label: 'Dispositivo', example: 'Mobile' },
      { id: 'email_client', label: 'Cliente Email', example: 'Apple Mail' },
      { id: 'signup_source', label: 'Fonte Cadastro', example: 'Landing Page' },
      { id: 'utm_source', label: 'UTM Source', example: 'facebook' },
      { id: 'utm_campaign', label: 'UTM Campaign', example: 'black-friday' }
    ]
  },
  {
    id: 'attributes',
    name: 'Atributos',
    icon: Users,
    color: 'text-warning',
    fields: [
      { id: 'has_tag', label: 'Possui Tag', example: 'VIP' },
      { id: 'in_list', label: 'Está em Lista', example: 'Newsletter' },
      { id: 'custom_field', label: 'Campo Custom', example: 'Idade ≥ 25' },
      { id: 'location', label: 'Localização', example: 'São Paulo' },
      { id: 'signup_date', label: 'Data Cadastro', example: '≥ 30 dias' },
      { id: 'quiz_result', label: 'Resultado Quiz', example: 'Investidor' }
    ]
  },
  {
    id: 'history',
    name: 'Histórico',
    icon: Clock,
    color: 'text-accent',
    fields: [
      { id: 'total_emails', label: 'Total Emails', example: '≥ 50' },
      { id: 'days_since_last', label: 'Dias desde último', example: '≤ 7' },
      { id: 'in_automation', label: 'Em Automação', example: 'Onboarding' },
      { id: 'campaign_received', label: 'Recebeu Campanha', example: 'Black Friday' },
      { id: 'campaign_opened', label: 'Abriu Campanha', example: 'Promoção' },
      { id: 'campaign_clicked', label: 'Clicou Campanha', example: 'Newsletter' }
    ]
  },
  {
    id: 'advanced',
    name: 'Avançados',
    icon: Zap,
    color: 'text-primary',
    fields: [
      { id: 'engagement_score', label: 'Score Engajamento', example: '80-100' },
      { id: 'frequency_cap', label: 'Frequency Cap', example: '≤ 3/dia' },
      { id: 'preferred_time', label: 'Horário Preferido', example: 'Manhã' },
      { id: 'link_clicked', label: 'Link Clicado', example: '/emprestimo' },
      { id: 'last_n_sends', label: 'Últimos N Envios', example: '≥ 2 cliques em 5' },
      { id: 'api_event', label: 'Evento API', example: 'purchase_completed' }
    ]
  }
];

export function FieldPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('engagement');

  const filteredFields = fieldCategories
    .find(cat => cat.id === selectedCategory)
    ?.fields.filter(field => 
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.example.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleFieldClick = (field: any) => {
    // This would trigger adding the field to the active card
    console.log('Add field to segment:', field);
  };

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          Campos Disponíveis
        </CardTitle>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
            <TabsTrigger value="engagement" className="text-xs">Engajamento</TabsTrigger>
            <TabsTrigger value="origin" className="text-xs">Origem</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-4">
            <TabsTrigger value="attributes" className="text-xs">Atributos</TabsTrigger>
            <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">Avançados</TabsTrigger>
          </TabsList>

          {fieldCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <category.icon className={`w-4 h-4 ${category.color}`} />
                  <h4 className="font-medium text-sm">{category.name}</h4>
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {(searchTerm ? filteredFields : category.fields).map(field => (
                    <div
                      key={field.id}
                      onClick={() => handleFieldClick(field)}
                      className="p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-all hover:bg-muted/50 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{field.label}</span>
                        <Badge variant="outline" className="text-xs opacity-60 group-hover:opacity-100">
                          Arrastar
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ex: {field.example}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}