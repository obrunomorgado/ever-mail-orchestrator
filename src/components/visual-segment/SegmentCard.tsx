import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConditionChip } from './ConditionChip';
import { X, GripVertical, Plus, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import type { SegmentCard as SegmentCardType, SegmentCondition } from '../VisualSegmentBuilder';

interface SegmentCardProps {
  card: SegmentCardType;
  onRemove: (cardId: string) => void;
  onAddCondition: (cardId: string, condition: SegmentCondition) => void;
  onRemoveCondition: (cardId: string, conditionId: string) => void;
  onUpdateCondition: (cardId: string, conditionId: string, updates: Partial<SegmentCondition>) => void;
}

const cardTypeConfig = {
  include: {
    title: 'Incluir',
    icon: CheckCircle,
    color: 'border-success bg-success/5',
    badgeColor: 'bg-success text-success-foreground',
    description: 'Contatos que atendem TODAS as condições abaixo (AND)'
  },
  amplify: {
    title: 'Ampliar (OU)',
    icon: ArrowRight,
    color: 'border-info bg-info/5',
    badgeColor: 'bg-info text-info-foreground',
    description: 'OU contatos que atendem TODAS as condições abaixo (OR)'
  },
  exclude: {
    title: 'Excluir',
    icon: AlertCircle,
    color: 'border-destructive bg-destructive/5',
    badgeColor: 'bg-destructive text-destructive-foreground',
    description: 'Remover contatos que atendem qualquer condição abaixo (NOT)'
  }
};

export function SegmentCard({
  card,
  onRemove,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition
}: SegmentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = cardTypeConfig[card.type];
  const Icon = config.icon;

  const addQuickCondition = () => {
    // Add a default condition that user can edit
    const newCondition: SegmentCondition = {
      id: `condition-${Date.now()}`,
      category: 'Engajamento',
      field: 'opens_30d',
      operator: '≥',
      value: '1',
      label: 'Aberturas últimos 30d ≥ 1'
    };
    onAddCondition(card.id, newCondition);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${isDragging ? 'opacity-50 scale-105' : ''}`}
    >
      <Card className={`${config.color} border-2 transition-all hover:shadow-md`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                {...attributes}
                {...listeners}
                className="cursor-move hover:bg-muted rounded p-1"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <Icon className="w-5 h-5" />
              <div>
                <Badge className={config.badgeColor}>
                  {config.title}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {config.description}
                </p>
              </div>
            </div>
            <Button
              onClick={() => onRemove(card.id)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Conditions */}
          <div className="space-y-2">
            {card.conditions.map((condition) => (
              <ConditionChip
                key={condition.id}
                condition={condition}
                onUpdate={(updates) => onUpdateCondition(card.id, condition.id, updates)}
                onRemove={() => onRemoveCondition(card.id, condition.id)}
              />
            ))}
          </div>

          {/* Add Condition Button */}
          <Button
            onClick={addQuickCondition}
            variant="outline"
            size="sm"
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Condição
          </Button>

          {/* AND Logic Indicator */}
          {card.conditions.length > 1 && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                Todas as condições acima (AND)
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}