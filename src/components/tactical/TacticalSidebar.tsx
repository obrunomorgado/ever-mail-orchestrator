import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Star, AlertTriangle, Sparkles, Users } from 'lucide-react';
import { TacticalSegment, DispatchTemplate, WeeklyCoverageData } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface TacticalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  segments: TacticalSegment[];
  templates: DispatchTemplate[];
  weeklyCoverage: WeeklyCoverageData;
  activeTab: 'audiences' | 'templates' | 'insights';
  onTabChange: (tab: 'audiences' | 'templates' | 'insights') => void;
}

const getHealthBadgeStyle = (health: string) => {
  switch (health) {
    case 'healthy':
      return 'bg-success/10 text-success';
    case 'fatigued':
      return 'bg-warning/10 text-warning';
    case 'spam_risk':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted/10 text-muted-foreground';
  }
};

const getHealthIcon = (health: string) => {
  switch (health) {
    case 'healthy':
      return '⚡';
    case 'fatigued':
      return '🟡';
    case 'spam_risk':
      return '🔴';
    default:
      return '⚪';
  }
};

const getScoreIcon = (score: string) => {
  switch (score) {
    case 'star':
      return <Star className="h-4 w-4 fill-current text-warning" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'new':
      return <Sparkles className="h-4 w-4 text-info" />;
    default:
      return null;
  }
};

export function TacticalSidebar({
  isOpen,
  onClose,
  segments,
  templates,
  weeklyCoverage,
  activeTab,
  onTabChange
}: TacticalSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, item: TacticalSegment | DispatchTemplate, type: 'segment' | 'template') => {
    e.dataTransfer.setData('application/json', JSON.stringify({ item, type }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Configuração Tática</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as any)} className="h-full">
          <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
            <TabsTrigger value="audiences">Audiências</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <div className="p-6 overflow-y-auto h-[calc(100vh-140px)]">
            <TabsContent value="audiences" className="space-y-4 mt-0">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar audiências..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de Segmentos */}
              <div className="space-y-3">
                {filteredSegments.map((segment) => (
                  <Card 
                    key={segment.id} 
                    className="cursor-move hover:shadow-md transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, segment, 'segment')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{segment.name}</h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{getHealthIcon(segment.health)}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getHealthBadgeStyle(segment.health))}
                          >
                            {segment.health === 'healthy' ? 'Saudável' : 
                             segment.health === 'fatigued' ? 'Fatigado' : 'Risco'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Tamanho:</span>
                          <span className="font-medium">{segment.size.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cobertura semanal:</span>
                          <span className="font-medium">{segment.metrics.weeklyCoverage}%</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {segment.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4 mt-0">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de Templates */}
              <div className="space-y-3">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-move hover:shadow-md transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, template, 'template')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getScoreIcon(template.score)}
                          <h4 className="font-medium text-sm">{template.name}</h4>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {template.subject}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">CTR:</span>
                          <span className="font-medium ml-1">{template.metrics.ctr}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Open Rate:</span>
                          <span className="font-medium ml-1">{template.metrics.openRate}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Spam Risk:</span>
                          <span className={cn(
                            "font-medium ml-1",
                            template.metrics.spamRisk > 0.3 ? "text-destructive" :
                            template.metrics.spamRisk > 0.1 ? "text-warning" : "text-success"
                          )}>
                            {(template.metrics.spamRisk * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Receita:</span>
                          <span className="font-medium ml-1">R$ {template.metrics.predictedRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-0">
              {/* Resumo da Base */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Saúde da Base
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Base atingida esta semana:</span>
                      <span className="font-medium">{weeklyCoverage.totalBaseReached}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Taxa de interpolação:</span>
                      <span className="font-medium">{weeklyCoverage.interpolationRate}%</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Saúde geral:</span>
                      <span className={cn(
                        "font-medium",
                        weeklyCoverage.baseHealth > 80 ? "text-success" :
                        weeklyCoverage.baseHealth > 60 ? "text-warning" : "text-destructive"
                      )}>
                        {weeklyCoverage.baseHealth}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview da Matriz de Overlap */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Matriz de Overlap</h4>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    Maiores sobreposições entre segmentos:
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Tech Enthusiasts × Black Friday</span>
                      <Badge variant="outline" className="text-warning">28%</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>VIP Ativos × Tech Enthusiasts</span>
                      <Badge variant="outline" className="text-warning">22%</Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Newsletter × Tech Enthusiasts</span>
                      <Badge variant="outline" className="text-info">18%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendações */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Recomendações</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-warning">⚠️</span>
                      <span>Alto overlap entre Tech Enthusiasts e outros segmentos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-success">✅</span>
                      <span>Base de Newsletter com boa capacidade para mais envios</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-info">ℹ️</span>
                      <span>Considere segmentar melhor o Tech Enthusiasts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}