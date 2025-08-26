import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, Clock, Plus, GitBranch, RotateCcw, Thermometer, 
  MessageSquare, Settings, Search, Target 
} from 'lucide-react';
import { mockActions } from '@/mocks/automationData';
import { AutomationAction } from '@/types/automation';

interface ActionLibraryProps {
  onActionSelect: (action: AutomationAction) => void;
  selectedCategory?: string;
}

export function ActionLibrary({ onActionSelect, selectedCategory }: ActionLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<AutomationAction | null>(null);
  const [actionConfig, setActionConfig] = useState<Record<string, any>>({});

  const getActionIcon = (iconName: string) => {
    const icons = {
      Send: Send,
      Clock: Clock,
      Plus: Plus,
      GitBranch: GitBranch,
      RotateCcw: RotateCcw,
      Thermometer: Thermometer,
      MessageSquare: MessageSquare,
      Settings: Settings
    };
    const IconComponent = icons[iconName as keyof typeof icons] || Target;
    return <IconComponent className="h-4 w-4" />;
  };

  const filteredActions = mockActions.filter(action => {
    const matchesSearch = action.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const actionsByCategory = {
    email: filteredActions.filter(a => a.category === 'email'),
    timing: filteredActions.filter(a => a.category === 'timing'),
    contact: filteredActions.filter(a => a.category === 'contact'),
    advanced: filteredActions.filter(a => a.category === 'advanced'),
    admin: filteredActions.filter(a => a.category === 'admin'),
    multichannel: filteredActions.filter(a => a.category === 'multichannel')
  };

  const handleActionClick = (action: AutomationAction) => {
    setSelectedAction(action);
    setActionConfig(action.config);
  };

  const handleConfigChange = (key: string, value: any) => {
    setActionConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToFlow = () => {
    if (selectedAction) {
      const actionWithConfig = {
        ...selectedAction,
        config: actionConfig
      };
      onActionSelect(actionWithConfig);
      setSelectedAction(null);
      setActionConfig({});
    }
  };

  const renderCategoryBadge = (category: string) => {
    const badgeColors = {
      email: 'bg-primary/10 text-primary',
      timing: 'bg-warning/10 text-warning',
      contact: 'bg-info/10 text-info',
      advanced: 'bg-success/10 text-success',
      admin: 'bg-destructive/10 text-destructive',
      multichannel: 'bg-accent/10 text-accent-foreground'
    };

    return (
      <Badge className={badgeColors[category as keyof typeof badgeColors]}>
        {category}
      </Badge>
    );
  };

  const renderActionConfig = (action: AutomationAction) => {
    switch (action.type) {
      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <Label>Template SendGrid</Label>
              <Select onValueChange={(value) => handleConfigChange('templateId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome-v1">Welcome Email v1</SelectItem>
                  <SelectItem value="welcome-v2">Welcome Email v2</SelectItem>
                  <SelectItem value="high-freq-template">Alta Frequência</SelectItem>
                  <SelectItem value="nurture-template">Nutrição</SelectItem>
                  <SelectItem value="reengagement-light">Reengajamento Leve</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Remetente Validado</Label>
              <Select 
                value={actionConfig.senderId || action.config.senderId}
                onValueChange={(value) => handleConfigChange('senderId', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified@publisher.com">verified@publisher.com</SelectItem>
                  <SelectItem value="deals@publisher.com">deals@publisher.com</SelectItem>
                  <SelectItem value="info@publisher.com">info@publisher.com</SelectItem>
                  <SelectItem value="support@publisher.com">support@publisher.com</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Tracking Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={actionConfig.trackOpens ?? action.config.trackOpens}
                    onCheckedChange={(checked) => handleConfigChange('trackOpens', checked)}
                  />
                  <Label>Rastrear Aberturas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={actionConfig.trackClicks ?? action.config.trackClicks}
                    onCheckedChange={(checked) => handleConfigChange('trackClicks', checked)}
                  />
                  <Label>Rastrear Cliques</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={actionConfig.trackUnsubscribes ?? action.config.trackUnsubscribes}
                    onCheckedChange={(checked) => handleConfigChange('trackUnsubscribes', checked)}
                  />
                  <Label>Rastrear Unsubscribes</Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Pool de Entrega</Label>
              <Select 
                value={actionConfig.deliveryPool || 'main-pool'}
                onValueChange={(value) => handleConfigChange('deliveryPool', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main-pool">Pool Principal</SelectItem>
                  <SelectItem value="backup-pool">Pool Backup</SelectItem>
                  <SelectItem value="shared-pool">Pool Compartilhado</SelectItem>
                  <SelectItem value="premium-pool">Pool Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'wait_time':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Dias</Label>
                <Input 
                  type="number"
                  value={actionConfig.waitDays || action.config.waitDays || 0}
                  onChange={(e) => handleConfigChange('waitDays', parseInt(e.target.value) || 0)}
                  min="0"
                  max="365"
                />
              </div>
              <div>
                <Label>Horas</Label>
                <Input 
                  type="number"
                  value={actionConfig.waitHours || action.config.waitHours || 0}
                  onChange={(e) => handleConfigChange('waitHours', parseInt(e.target.value) || 0)}
                  min="0"
                  max="23"
                />
              </div>
              <div>
                <Label>Minutos</Label>
                <Input 
                  type="number"
                  value={actionConfig.waitMinutes || action.config.waitMinutes || 0}
                  onChange={(e) => handleConfigChange('waitMinutes', parseInt(e.target.value) || 0)}
                  min="0"
                  max="59"
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>⚠️ Limite máximo: 365 dias</p>
              <p>Total: {
                ((actionConfig.waitDays || 0) + 
                 (actionConfig.waitHours || 0) / 24 + 
                 (actionConfig.waitMinutes || 0) / (24 * 60)).toFixed(2)
              } dias</p>
            </div>
          </div>
        );

      case 'add_tag':
      case 'remove_tag':
        return (
          <div className="space-y-4">
            <div>
              <Label>Nome da Tag</Label>
              <Input 
                value={actionConfig.tagName || action.config.tagName || ''}
                onChange={(e) => handleConfigChange('tagName', e.target.value)}
                placeholder="Ex: vip-customer, engaged-user"
              />
            </div>
            {action.type === 'add_tag' && (
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={actionConfig.createIfNotExists ?? action.config.createIfNotExists}
                  onCheckedChange={(checked) => handleConfigChange('createIfNotExists', checked)}
                />
                <Label>Criar tag se não existir</Label>
              </div>
            )}
          </div>
        );

      case 'split_ab':
        return (
          <div className="space-y-4">
            <Label>Configuração de Caminhos</Label>
            {(actionConfig.paths || action.config.paths || []).map((path: any, index: number) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div>
                  <Label>Nome do Caminho {index + 1}</Label>
                  <Input 
                    value={path.label}
                    onChange={(e) => {
                      const newPaths = [...(actionConfig.paths || action.config.paths)];
                      newPaths[index] = { ...newPaths[index], label: e.target.value };
                      handleConfigChange('paths', newPaths);
                    }}
                  />
                </div>
                <div>
                  <Label>Percentual (%)</Label>
                  <Input 
                    type="number"
                    value={path.percentage}
                    onChange={(e) => {
                      const newPaths = [...(actionConfig.paths || action.config.paths)];
                      newPaths[index] = { ...newPaths[index], percentage: parseInt(e.target.value) || 0 };
                      handleConfigChange('paths', newPaths);
                    }}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const currentPaths = actionConfig.paths || action.config.paths || [];
                if (currentPaths.length < 5) {
                  const newPaths = [...currentPaths, { label: `Variante ${currentPaths.length + 1}`, percentage: 20 }];
                  handleConfigChange('paths', newPaths);
                }
              }}
              disabled={(actionConfig.paths || action.config.paths || []).length >= 5}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Caminho
            </Button>
          </div>
        );

      case 'resend_unopened':
        return (
          <div className="space-y-4">
            <div>
              <Label>Tempo de Espera (horas)</Label>
              <Input 
                type="number"
                value={actionConfig.waitHours || action.config.waitHours || 48}
                onChange={(e) => handleConfigChange('waitHours', parseInt(e.target.value) || 48)}
                min="1"
                max="168"
              />
            </div>
            
            <div>
              <Label>Novo Assunto</Label>
              <Textarea 
                value={actionConfig.newSubject || action.config.newSubject || ''}
                onChange={(e) => handleConfigChange('newSubject', e.target.value)}
                placeholder="Assunto alternativo para o reenvio"
                rows={2}
              />
            </div>
            
            <div>
              <Label>Máximo de Reenvios</Label>
              <Select 
                value={String(actionConfig.maxResends || action.config.maxResends || 1)}
                onValueChange={(value) => handleConfigChange('maxResends', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 reenvio</SelectItem>
                  <SelectItem value="2">2 reenvios</SelectItem>
                  <SelectItem value="3">3 reenvios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'multichannel':
        return (
          <div className="space-y-4">
            <Label>Canais Simultâneos</Label>
            <div className="space-y-2">
              {['SMS', 'Push Notification', 'WhatsApp'].map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Switch 
                    checked={
                      (actionConfig.channels || action.config.channels || [])
                        .includes(channel.toLowerCase().replace(' ', '_'))
                    }
                    onCheckedChange={(checked) => {
                      const currentChannels = actionConfig.channels || action.config.channels || [];
                      const channelKey = channel.toLowerCase().replace(' ', '_');
                      const newChannels = checked 
                        ? [...currentChannels, channelKey]
                        : currentChannels.filter((c: string) => c !== channelKey);
                      handleConfigChange('channels', newChannels);
                    }}
                  />
                  <Label>{channel}</Label>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                checked={actionConfig.fallbackEmail ?? action.config.fallbackEmail}
                onCheckedChange={(checked) => handleConfigChange('fallbackEmail', checked)}
              />
              <Label>Fallback para Email se outros canais falharem</Label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-muted-foreground">
            <Settings className="h-8 w-8 mx-auto mb-2" />
            <p>Configurações básicas</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar ações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Lista de Actions */}
        <div className="w-2/3 border-r">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <div className="p-4 pb-0">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
                <TabsTrigger value="contact">Contato</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="multichannel">Multi</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {filteredActions.map((action) => (
                    <Card 
                      key={action.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAction?.id === action.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleActionClick(action)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              {getActionIcon(action.icon)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{action.label}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {action.description}
                              </p>
                              {action.limits && (
                                <div className="text-xs text-warning mt-1">
                                  {action.limits.maxWaitDays && `Max ${action.limits.maxWaitDays}d`}
                                  {action.limits.maxSplitPaths && `Max ${action.limits.maxSplitPaths} caminhos`}
                                </div>
                              )}
                            </div>
                          </div>
                          {renderCategoryBadge(action.category)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Tabs para categorias específicas */}
            {Object.entries(actionsByCategory).map(([category, actions]) => (
              <TabsContent key={category} value={category} className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {actions.map((action) => (
                      <Card 
                        key={action.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedAction?.id === action.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleActionClick(action)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              {getActionIcon(action.icon)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{action.label}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {action.description}
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

        {/* Configuração da Action Selecionada */}
        <div className="w-1/3 flex flex-col">
          {selectedAction ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getActionIcon(selectedAction.icon)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedAction.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedAction.description}
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {renderActionConfig(selectedAction)}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <Button onClick={handleAddToFlow} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar ao Fluxo
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Selecione uma Ação</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha uma ação da lista para configurar suas opções
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}