import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, RotateCcw, Star, AlertTriangle, Sparkles } from 'lucide-react';
import { TacticalSlotData } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface TacticalSlotCardProps {
  slotData: TacticalSlotData;
  onDrop?: (slotId: string, data: any) => void;
  onGenerateVariation?: (slotId: string) => void;
  onReuseTemplate?: (slotId: string) => void;
  isDragOver?: boolean;
  onClick?: () => void;
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
      return <Star className="h-3 w-3 fill-current text-warning" />;
    case 'warning':
      return <AlertTriangle className="h-3 w-3 text-warning" />;
    case 'new':
      return <Sparkles className="h-3 w-3 text-info" />;
    default:
      return null;
  }
};

const getPoolColor = (pool: string) => {
  switch (pool) {
    case 'Pool A':
      return 'bg-success/10 text-success border-success/20';
    case 'Pool B':
      return 'bg-info/10 text-info border-info/20';
    case 'Pool C':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted/10 text-muted-foreground border-muted/20';
  }
};

export function TacticalSlotCard({ 
  slotData, 
  onDrop, 
  onGenerateVariation, 
  onReuseTemplate,
  isDragOver = false,
  onClick 
}: TacticalSlotCardProps) {
  const { slot, segment, template, pool, customSubject, isActive } = slotData;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data && onDrop) {
      onDrop(slot, JSON.parse(data));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (!isActive) {
    return (
      <Card 
        className={cn(
          "border-2 border-dashed border-muted hover:border-primary/50 transition-all cursor-pointer h-full min-h-[200px]",
          isDragOver && "border-primary bg-primary/5"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={onClick}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
          <div className="text-center text-muted-foreground space-y-2">
            <div className="text-2xl">📧</div>
            <p className="text-sm font-medium">Arraste Segmento aqui</p>
            <p className="text-xs">ou clique para configurar</p>
            <Badge variant="outline" className={cn("text-xs", getPoolColor(pool))}>
              {pool}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "border hover:shadow-md transition-all cursor-pointer h-full",
        isDragOver && "border-primary bg-primary/5"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-4">
        {/* Cabeçalho com Segmento */}
        {segment && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{segment.name}</h3>
              <div className="flex items-center gap-1">
                <span className="text-xs">{getHealthIcon(segment.health)}</span>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getHealthBadgeStyle(segment.health))}
                >
                  {segment.health === 'healthy' ? 'Saudável' : 
                   segment.health === 'fatigued' ? 'Fatigado' : 'Risco Spam'}
                </Badge>
              </div>
            </div>
            
            {/* Métricas do Segmento */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Envios esperados:</span>
                <p className="font-medium">{segment.metrics.expectedSends.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Interpolados:</span>
                <p className="font-medium">{segment.metrics.interpolated.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fora da base:</span>
                <p className="font-medium">{segment.metrics.outOfBase.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cobertura semanal:</span>
                <p className="font-medium">{segment.metrics.weeklyCoverage}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Template Anexado */}
        {template && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(template.score)}
                <span className="text-sm font-medium">{template.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            </div>
            
            {/* Subject personalizado ou padrão */}
            <p className="text-xs text-muted-foreground">
              {customSubject || template.subject}
            </p>
            
            {/* Mini KPIs */}
            <div className="flex items-center justify-between text-xs">
              <span>CTR: {template.metrics.ctr}%</span>
              <span>Receita prev.: R$ {template.metrics.predictedRevenue.toLocaleString()}</span>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateVariation?.(slot);
                }}
              >
                Gerar Variação
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onReuseTemplate?.(slot);
                }}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reusar
              </Button>
            </div>
          </div>
        )}

        {/* Pool Badge */}
        <div className="flex justify-end">
          <Badge className={cn("text-xs", getPoolColor(pool))}>
            {pool}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}