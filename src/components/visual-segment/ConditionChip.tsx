import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Edit2, Check } from 'lucide-react';
import type { SegmentCondition } from '../VisualSegmentBuilder';

interface ConditionChipProps {
  condition: SegmentCondition;
  onUpdate: (updates: Partial<SegmentCondition>) => void;
  onRemove: () => void;
}

const fieldOperators: Record<string, string[]> = {
  'opens_30d': ['≥', '≤', '=', 'entre'],
  'opens_60d': ['≥', '≤', '=', 'entre'],
  'opens_90d': ['≥', '≤', '=', 'entre'],
  'clicks_30d': ['≥', '≤', '=', 'entre'],
  'clicks_60d': ['≥', '≤', '=', 'entre'],
  'clicks_90d': ['≥', '≤', '=', 'entre'],
  'has_tag': ['possui', 'não possui'],
  'provider': ['é', 'não é', 'contém'],
  'domain': ['é', 'não é', 'contém'],
  'default': ['≥', '≤', '=', 'contém', 'é', 'não é']
};

const fieldLabels: Record<string, string> = {
  'opens_30d': 'Aberturas 30d',
  'opens_60d': 'Aberturas 60d',
  'opens_90d': 'Aberturas 90d',
  'clicks_30d': 'Cliques 30d',
  'clicks_60d': 'Cliques 60d',
  'clicks_90d': 'Cliques 90d',
  'has_tag': 'Possui Tag',
  'provider': 'Provedor',
  'domain': 'Domínio'
};

export function ConditionChip({ condition, onUpdate, onRemove }: ConditionChipProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editOperator, setEditOperator] = useState(condition.operator);
  const [editValue, setEditValue] = useState(condition.value);

  const fieldLabel = fieldLabels[condition.field] || condition.field;
  const availableOperators = fieldOperators[condition.field] || fieldOperators.default;

  const handleSave = () => {
    onUpdate({
      operator: editOperator,
      value: editValue,
      label: `${fieldLabel} ${editOperator} ${editValue}`
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditOperator(condition.operator);
    setEditValue(condition.value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-lg border">
        <span className="text-sm font-medium">{fieldLabel}</span>
        
        <Select value={editOperator} onValueChange={setEditOperator}>
          <SelectTrigger className="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableOperators.map(op => (
              <SelectItem key={op} value={op}>{op}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-20 h-8"
          placeholder="Valor"
        />

        <div className="flex gap-1">
          <Button onClick={handleSave} size="sm" variant="ghost" className="h-6 w-6 p-0">
            <Check className="w-3 h-3 text-success" />
          </Button>
          <Button onClick={handleCancel} size="sm" variant="ghost" className="h-6 w-6 p-0">
            <X className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <Badge
        variant="secondary"
        className="px-3 py-1 text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {condition.label}
        <Edit2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Badge>
      
      <Button
        onClick={onRemove}
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}