import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, UserPlus, Tag, Mail, Webhook, Calendar, 
  Clock, Target, Filter, Search 
} from 'lucide-react';
import { mockTriggers } from '@/mocks/automationData';
import { AutomationTrigger } from '@/types/automation';

interface TriggerLibraryProps {
  onTriggerSelect: (trigger: AutomationTrigger) => void;
  selectedCategory?: string;
}

export function TriggerLibrary({ onTriggerSelect, selectedCategory }: TriggerLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState<AutomationTrigger | null>(null);
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>({});

  const getTriggerIcon = (iconName: string) => {
    const icons = {
      Upload: Upload,
      UserPlus: UserPlus, 
      Tag: Tag,
      Mail: Mail,
      Webhook: Webhook,
      Calendar: Calendar
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Target;
    return <IconComponent className="h-4 w-4" />;
  };

  const filteredTriggers = mockTriggers.filter(trigger => {
    const matchesSearch = trigger.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trigger.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || trigger.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const triggersByCategory = {
    contact: filteredTriggers.filter(t => t.category === 'contact'),
    engagement: filteredTriggers.filter(t => t.category === 'engagement'),
    system: filteredTriggers.filter(t => t.category === 'system'),
    external: filteredTriggers.filter(t => t.category === 'external')
  };

  const handleTriggerClick = (trigger: AutomationTrigger) => {
    setSelectedTrigger(trigger);
    setTriggerConfig(trigger.config);
  };

  const handleConfigChange = (key: string, value: any) => {
    setTriggerConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToFlow = () => {
    if (selectedTrigger) {
      const triggerWithConfig = {
        ...selectedTrigger,
        config: triggerConfig
      };
      onTriggerSelect(triggerWithConfig);
      setSelectedTrigger(null);
      setTriggerConfig({});
    }
  };

  const renderCategoryBadge = (category: string) => {
    const badgeColors = {
      contact: 'bg-primary/10 text-primary',
      engagement: 'bg-warning/10 text-warning', 
      system: 'bg-info/10 text-info',
      external: 'bg-success/10 text-success'
    };

    return (
      <Badge className={badgeColors[category as keyof typeof badgeColors]}>
        {category}
      </Badge>
    );
  };

  const renderTriggerConfig = (trigger: AutomationTrigger) => {
    switch (trigger.type) {
      case 'list_entry':
        return (
          <div className="space-y-4">
            <div>
              <Label>Lista de Destino</Label>
              <Select onValueChange={(value) => handleConfigChange('listId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar lista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black-friday-cards">Cartão Black Friday</SelectItem>
                  <SelectItem value="newsletter-main">Newsletter Principal</SelectItem>
                  <SelectItem value="vip-customers">Clientes VIP</SelectItem>
                  <SelectItem value="new-subscribers">Novos Assinantes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={triggerConfig.allowReentry || false}
                onCheckedChange={(checked) => handleConfigChange('allowReentry', checked)}
              />
              <Label>Permitir reentrada na automação</Label>
            </div>
          </div>
        );

      case 'tag_added':
        return (
          <div className="space-y-4">
            <div>
              <Label>Nome da Tag</Label>
              <Input 
                value={triggerConfig.tagName || ''}
                onChange={(e) => handleConfigChange('tagName', e.target.value)}
                placeholder="Ex: vip-customer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={triggerConfig.caseSensitive || false}
                onCheckedChange={(checked) => handleConfigChange('caseSensitive', checked)}
              />
              <Label>Sensível a maiúsculas/minúsculas</Label>
            </div>
          </div>
        );

      case 'campaign_engagement':
        return (
          <div className="space-y-4">
            <div>
              <Label>Campanha</Label>
              <Select onValueChange={(value) => handleConfigChange('campaignId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar campanha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome-email-1">Welcome Email #1</SelectItem>
                  <SelectItem value="promo-black-friday">Promo Black Friday</SelectItem>
                  <SelectItem value="newsletter-weekly">Newsletter Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Janela de Tempo (horas)</Label>
              <Input 
                type="number"
                value={triggerConfig.timeWindow || 24}
                onChange={(e) => handleConfigChange('timeWindow', parseInt(e.target.value))}
                min="1"
                max="168"
              />
            </div>
          </div>
        );

      case 'external_event':
        return (
          <div className="space-y-4">
            <div>
              <Label>Tipo de Evento</Label>
              <Select onValueChange={(value) => handleConfigChange('eventType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz_completed">Quiz Concluído</SelectItem>
                  <SelectItem value="payment_received">Pagamento Recebido</SelectItem>
                  <SelectItem value="form_submitted">Formulário Enviado</SelectItem>
                  <SelectItem value="product_purchased">Produto Comprado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Webhook URL</Label>
              <Input 
                value={triggerConfig.webhookUrl || ''}
                onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                placeholder="https://api.exemplo.com/webhook"
              />
            </div>
          </div>
        );

      case 'anniversary':
        return (
          <div className="space-y-4">
            <div>
              <Label>Campo de Data</Label>
              <Select onValueChange={(value) => handleConfigChange('dateField', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Aniversário</SelectItem>
                  <SelectItem value="signup_date">Data de Cadastro</SelectItem>
                  <SelectItem value="first_purchase">Primeira Compra</SelectItem>
                  <SelectItem value="subscription_start">Início Assinatura</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Offset (dias antes/depois)</Label>
              <Input 
                type="number"
                value={triggerConfig.daysOffset || 0}
                onChange={(e) => handleConfigChange('daysOffset', parseInt(e.target.value))}
                min="-30"
                max="30"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            <Filter className="h-8 w-8 mx-auto mb-2" />
            <p>Configurações básicas</p>
          </div>
        );
    }
  };

  const renderFrequencyConfig = (trigger: AutomationTrigger) => {
    return (
      <div className="space-y-3">
        <Label>Frequência de Entrada</Label>
        <Select 
          value={triggerConfig.frequency || trigger.entryOptions.frequency}
          onValueChange={(value) => handleConfigChange('frequency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">Apenas uma vez</SelectItem>
            <SelectItem value="cooldown">Uma vez por período</SelectItem>
            <SelectItem value="multiple">Múltiplas vezes</SelectItem>
          </SelectContent>
        </Select>
        
        {(triggerConfig.frequency === 'cooldown' || trigger.entryOptions.frequency === 'cooldown') && (
          <div>
            <Label>Período de Cooldown (horas)</Label>
            <Input 
              type="number"
              value={triggerConfig.cooldownPeriod || trigger.entryOptions.cooldownPeriod || 24}
              onChange={(e) => handleConfigChange('cooldownPeriod', parseInt(e.target.value))}
              min="1"
              max="8760"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar triggers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Lista de Triggers */}
        <div className="w-2/3 border-r">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <div className="p-4 pb-0">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="contact">Contato</TabsTrigger>
                <TabsTrigger value="engagement">Engajamento</TabsTrigger>
                <TabsTrigger value="system">Sistema</TabsTrigger>
                <TabsTrigger value="external">Externo</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {filteredTriggers.map((trigger) => (
                    <Card 
                      key={trigger.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTrigger?.id === trigger.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleTriggerClick(trigger)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              {getTriggerIcon(trigger.icon)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{trigger.label}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {trigger.description}
                              </p>
                            </div>
                          </div>
                          {renderCategoryBadge(trigger.category)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tabs para categorias específicas */}
            {Object.entries(triggersByCategory).map(([category, triggers]) => (
              <TabsContent key={category} value={category} className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {triggers.map((trigger) => (
                      <Card 
                        key={trigger.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTrigger?.id === trigger.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleTriggerClick(trigger)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              {getTriggerIcon(trigger.icon)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{trigger.label}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {trigger.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Configuração do Trigger Selecionado */}
        <div className="w-1/3 flex flex-col">
          {selectedTrigger ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getTriggerIcon(selectedTrigger.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedTrigger.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedTrigger.description}
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Configurações específicas */}
                  <div>
                    <h4 className="font-medium mb-3">Configurações</h4>
                    {renderTriggerConfig(selectedTrigger)}
                  </div>

                  {/* Frequência de entrada */}
                  <div>
                    <h4 className="font-medium mb-3">Opções de Entrada</h4>
                    {renderFrequencyConfig(selectedTrigger)}
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <Button onClick={handleAddToFlow} className="w-full">
                  <Clock className="mr-2 h-4 w-4" />
                  Adicionar ao Fluxo
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Selecione um Trigger</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha um trigger da lista para configurar suas opções
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}