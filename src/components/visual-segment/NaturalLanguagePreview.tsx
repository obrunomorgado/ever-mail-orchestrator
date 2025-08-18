import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import type { SegmentCard } from '../VisualSegmentBuilder';

interface NaturalLanguagePreviewProps {
  cards: SegmentCard[];
  segmentName: string;
}

export function NaturalLanguagePreview({ cards, segmentName }: NaturalLanguagePreviewProps) {
  const generateNaturalLanguage = (): string => {
    if (cards.length === 0 || cards.every(card => card.conditions.length === 0)) {
      return 'Configure as condições para ver a prévia em linguagem natural';
    }

    const parts: string[] = [];

    cards.forEach((card, index) => {
      if (card.conditions.length === 0) return;

      let prefix = '';
      if (card.type === 'include') {
        prefix = index === 0 ? 'Enviar para quem' : 'E quem';
      } else if (card.type === 'amplify') {
        prefix = 'OU quem';
      } else if (card.type === 'exclude') {
        prefix = 'exceto quem';
      }

      const conditionsText = card.conditions
        .map(c => {
          const value = c.value;
          const operator = c.operator;
          const field = c.field;
          
          // Format based on field type
          if (field.includes('opens') || field.includes('clicks')) {
            const period = field.includes('30d') ? '30 dias' : 
                          field.includes('60d') ? '60 dias' : 
                          field.includes('90d') ? '90 dias' : 
                          field.includes('7d') ? '7 dias' : '';
            const action = field.includes('opens') ? 'abriu' : 'clicou';
            return `${action} ${operator} ${value} nos últimos ${period}`;
          }
          
          if (field === 'has_tag') {
            return operator === 'possui' ? `tem tag "${value}"` : `não tem tag "${value}"`;
          }
          
          if (field === 'provider') {
            return `${operator === 'é' ? 'usa' : 'não usa'} ${value}`;
          }
          
          return `${field} ${operator} ${value}`;
        })
        .join(' E ');

      parts.push(`${prefix} ${conditionsText}`);
    });

    let result = parts.join(', ');
    
    // Add segment name if provided
    if (segmentName.trim()) {
      result = `"${segmentName}": ${result}`;
    }

    return result;
  };

  const naturalText = generateNaturalLanguage();
  const isEmpty = cards.length === 0 || cards.every(card => card.conditions.length === 0);

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
      <MessageSquare className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            Linguagem Natural
          </Badge>
          {!isEmpty && (
            <Badge variant="secondary" className="text-xs">
              Ativo
            </Badge>
          )}
        </div>
        <p className={`text-sm leading-relaxed ${isEmpty ? 'text-muted-foreground italic' : 'text-foreground'}`}>
          {naturalText}
        </p>
      </div>
    </div>
  );
}