import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SegmentCard } from './visual-segment/SegmentCard';
import { FieldPanel } from './visual-segment/FieldPanel';
import { NaturalLanguagePreview } from './visual-segment/NaturalLanguagePreview';
import { SegmentTemplates } from './visual-segment/SegmentTemplates';
import { Target, Plus, Save, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface SegmentCondition {
  id: string;
  category: string;
  field: string;
  operator: string;
  value: string;
  label: string;
}

export interface SegmentCard {
  id: string;
  type: 'include' | 'amplify' | 'exclude';
  conditions: SegmentCondition[];
}

const INITIAL_CARDS: SegmentCard[] = [
  {
    id: 'include-1',
    type: 'include',
    conditions: []
  }
];

export function VisualSegmentBuilder() {
  const [segmentName, setSegmentName] = useState('');
  const [cards, setCards] = useState<SegmentCard[]>(INITIAL_CARDS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const { toast } = useToast();

  const estimatedSize = useMemo(() => {
    // Calculate estimated contacts based on conditions
    const hasConditions = cards.some(card => card.conditions.length > 0);
    if (!hasConditions) return 0;
    
    // Simple estimation logic - would be replaced with real API call
    let base = 150000;
    cards.forEach(card => {
      if (card.type === 'include') {
        base *= 0.3; // Include narrows down
      } else if (card.type === 'amplify') {
        base *= 1.4; // Amplify adds more
      } else if (card.type === 'exclude') {
        base *= 0.95; // Exclude removes some
      }
    });
    return Math.floor(base);
  }, [cards]);

  const addCard = (type: 'include' | 'amplify' | 'exclude') => {
    const newCard: SegmentCard = {
      id: `${type}-${Date.now()}`,
      type,
      conditions: []
    };
    setCards(prev => [...prev, newCard]);
  };

  const removeCard = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  };

  const addCondition = (cardId: string, condition: SegmentCondition) => {
    setCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, conditions: [...card.conditions, condition] }
        : card
    ));
  };

  const removeCondition = (cardId: string, conditionId: string) => {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? { ...card, conditions: card.conditions.filter(c => c.id !== conditionId) }
        : card
    ));
  };

  const updateCondition = (cardId: string, conditionId: string, updates: Partial<SegmentCondition>) => {
    setCards(prev => prev.map(card =>
      card.id === cardId
        ? {
            ...card,
            conditions: card.conditions.map(c =>
              c.id === conditionId ? { ...c, ...updates } : c
            )
          }
        : card
    ));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    // Handle reordering logic here if needed
  };

  const applyTemplate = (template: any) => {
    setSegmentName(template.name);
    const newCard: SegmentCard = {
      id: 'include-template',
      type: 'include',
      conditions: template.criteria.map((criterion: any, index: number) => ({
        id: `condition-${index}`,
        category: 'Engajamento',
        field: criterion.field,
        operator: criterion.operator,
        value: criterion.value,
        label: `${criterion.field} ${criterion.operator} ${criterion.value}`
      }))
    };
    setCards([newCard]);
    setShowTemplates(false);
    toast({
      title: "Template aplicado",
      description: `Segmento "${template.name}" carregado com sucesso.`,
    });
  };

  const saveSegment = () => {
    if (!segmentName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o segmento.",
        variant: "destructive"
      });
      return;
    }

    const hasConditions = cards.some(card => card.conditions.length > 0);
    if (!hasConditions) {
      toast({
        title: "Condições obrigatórias",
        description: "Adicione pelo menos uma condição ao segmento.",
        variant: "destructive"
      });
      return;
    }

    // Save logic would go here
    toast({
      title: "Segmento salvo",
      description: `"${segmentName}" foi criado com ${estimatedSize.toLocaleString()} contatos.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with natural language preview */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Construtor de Segmentos</CardTitle>
                <p className="text-muted-foreground">
                  Crie segmentos intuitivamente com lógica visual simplificada
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-4 py-2">
                ≈ {estimatedSize.toLocaleString()} contatos
              </Badge>
              <Button 
                onClick={() => setShowTemplates(!showTemplates)}
                variant="outline"
                size="sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <NaturalLanguagePreview cards={cards} segmentName={segmentName} />
          
          <div className="flex items-center gap-4 mt-4">
            <input
              type="text"
              placeholder="Nome do segmento..."
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={saveSegment} disabled={!segmentName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Segmento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Section */}
      {showTemplates && (
        <SegmentTemplates onApplyTemplate={applyTemplate} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Building Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Construtor Visual</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => addCard('include')}
                size="sm"
                className="bg-success hover:bg-success/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                Incluir
              </Button>
              <Button
                onClick={() => addCard('amplify')}
                size="sm"
                className="bg-info hover:bg-info/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ampliar
              </Button>
              <Button
                onClick={() => addCard('exclude')}
                size="sm"
                variant="destructive"
              >
                <Plus className="w-4 h-4 mr-1" />
                Excluir
              </Button>
            </div>
          </div>

          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {cards.map((card) => (
                  <SegmentCard
                    key={card.id}
                    card={card}
                    onRemove={removeCard}
                    onAddCondition={addCondition}
                    onRemoveCondition={removeCondition}
                    onUpdateCondition={updateCondition}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="opacity-50">
                  {/* Drag overlay content */}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {cards.length === 0 && (
            <Card className="border-dashed border-2 p-8 text-center">
              <p className="text-muted-foreground">
                Comece adicionando um cartão de condições ou selecione um template
              </p>
            </Card>
          )}
        </div>

        {/* Field Panel */}
        <div className="lg:col-span-1">
          <FieldPanel />
        </div>
      </div>
    </div>
  );
}