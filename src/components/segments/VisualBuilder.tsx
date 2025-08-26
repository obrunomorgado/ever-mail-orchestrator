import { useState } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DndContext, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { SegmentCard, SegmentCondition, SegmentEvent, AdvancedFilter } from "@/types/segments";

interface VisualBuilderProps {
  cards: SegmentCard[];
  onCardsChange: (cards: SegmentCard[]) => void;
  logic: "AND" | "OR";
  onLogicChange: (logic: "AND" | "OR") => void;
  availableEvents: SegmentEvent[];
  availableFilters: AdvancedFilter[];
}

const cardTypeConfig = {
  include: {
    title: "Incluir",
    description: "Contatos que atendem estas condições",
    color: "bg-green-100 text-green-800 border-green-200"
  },
  amplify: {
    title: "Amplificar", 
    description: "Priorizar contatos com estas características",
    color: "bg-blue-100 text-blue-800 border-blue-200"
  },
  exclude: {
    title: "Excluir",
    description: "Remover contatos que atendem estas condições",
    color: "bg-red-100 text-red-800 border-red-200"
  }
};

export function VisualBuilder({ 
  cards, 
  onCardsChange, 
  logic, 
  onLogicChange,
  availableEvents,
  availableFilters 
}: VisualBuilderProps) {
  
  const addCard = (type: "include" | "amplify" | "exclude") => {
    const newCard: SegmentCard = {
      id: `card_${Date.now()}`,
      type,
      conditions: []
    };
    onCardsChange([...cards, newCard]);
  };

  const removeCard = (cardId: string) => {
    onCardsChange(cards.filter(card => card.id !== cardId));
  };

  const duplicateCard = (card: SegmentCard) => {
    const newCard: SegmentCard = {
      ...card,
      id: `card_${Date.now()}`,
      conditions: card.conditions.map(condition => ({
        ...condition,
        id: `cond_${Date.now()}_${Math.random()}`
      }))
    };
    onCardsChange([...cards, newCard]);
  };

  const updateCard = (cardId: string, updates: Partial<SegmentCard>) => {
    onCardsChange(cards.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    ));
  };

  const addCondition = (cardId: string) => {
    const newCondition: SegmentCondition = {
      id: `cond_${Date.now()}`,
      field: "",
      operator: "",
      value: ""
    };
    
    updateCard(cardId, {
      conditions: [...(cards.find(c => c.id === cardId)?.conditions || []), newCondition]
    });
  };

  const removeCondition = (cardId: string, conditionId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      updateCard(cardId, {
        conditions: card.conditions.filter(c => c.id !== conditionId)
      });
    }
  };

  const updateCondition = (cardId: string, conditionId: string, updates: Partial<SegmentCondition>) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      updateCard(cardId, {
        conditions: card.conditions.map(condition =>
          condition.id === conditionId ? { ...condition, ...updates } : condition
        )
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeIndex = cards.findIndex(card => card.id === active.id);
    const overIndex = cards.findIndex(card => card.id === over.id);
    
    if (activeIndex !== overIndex) {
      const newCards = [...cards];
      const [removed] = newCards.splice(activeIndex, 1);
      newCards.splice(overIndex, 0, removed);
      onCardsChange(newCards);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logic Selector */}
      <div className="flex items-center gap-4">
        <Label>Lógica entre condições:</Label>
        <Select value={logic} onValueChange={(value: "AND" | "OR") => onLogicChange(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">E (AND)</SelectItem>
            <SelectItem value="OR">OU (OR)</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {logic === "AND" ? "Todas as condições devem ser atendidas" : "Pelo menos uma condição deve ser atendida"}
        </div>
      </div>

      <Separator />

      {/* Add Card Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => addCard("include")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Incluir
        </Button>
        <Button
          variant="outline"
          onClick={() => addCard("amplify")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Amplificar
        </Button>
        <Button
          variant="outline"
          onClick={() => addCard("exclude")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Excluir
        </Button>
      </div>

      {/* Cards */}
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {cards.map((card, index) => (
              <div key={card.id}>
                <SortableCard
                  card={card}
                  availableEvents={availableEvents}
                  availableFilters={availableFilters}
                  onAddCondition={() => addCondition(card.id)}
                  onRemoveCondition={(conditionId) => removeCondition(card.id, conditionId)}
                  onUpdateCondition={(conditionId, updates) => updateCondition(card.id, conditionId, updates)}
                  onRemoveCard={() => removeCard(card.id)}
                  onDuplicateCard={() => duplicateCard(card)}
                />
                {index < cards.length - 1 && (
                  <div className="flex items-center justify-center py-2">
                    <Badge variant="outline" className="px-3 py-1">
                      {logic}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {cards.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Nenhuma condição adicionada</p>
          <p>Comece adicionando uma condição de inclusão, amplificação ou exclusão</p>
        </div>
      )}
    </div>
  );
}

interface SortableCardProps {
  card: SegmentCard;
  availableEvents: SegmentEvent[];
  availableFilters: AdvancedFilter[];
  onAddCondition: () => void;
  onRemoveCondition: (conditionId: string) => void;
  onUpdateCondition: (conditionId: string, updates: Partial<SegmentCondition>) => void;
  onRemoveCard: () => void;
  onDuplicateCard: () => void;
}

function SortableCard({
  card,
  availableEvents,
  availableFilters,
  onAddCondition,
  onRemoveCondition,
  onUpdateCondition,
  onRemoveCard,
  onDuplicateCard
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = cardTypeConfig[card.type];
  const allOptions = [...availableEvents, ...availableFilters];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-opacity",
        isDragging && "opacity-50"
      )}
    >
      <Card className={cn("border-2", config.color)}>
        <CardHeader 
          {...attributes}
          {...listeners}
          className="cursor-move pb-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">{config.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicateCard}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveCard}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conditions */}
          {card.conditions.map((condition, index) => (
            <div key={condition.id}>
              <div className="grid grid-cols-4 gap-2 items-end">
                <div>
                  <Label className="text-xs">Campo</Label>
                  <Select
                    value={condition.field}
                    onValueChange={(value) => onUpdateCondition(condition.id, { field: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {allOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Operador</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => onUpdateCondition(condition.id, { operator: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Op." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="≥">≥ (maior ou igual)</SelectItem>
                      <SelectItem value="≤">≤ (menor ou igual)</SelectItem>
                      <SelectItem value="=">=  (igual)</SelectItem>
                      <SelectItem value="entre">entre</SelectItem>
                      <SelectItem value="contém">contém</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Valor</Label>
                  <Input
                    className="h-8"
                    value={condition.value}
                    onChange={(e) => onUpdateCondition(condition.id, { value: e.target.value })}
                    placeholder="Valor"
                  />
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCondition(condition.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {index < card.conditions.length - 1 && (
                <div className="flex justify-center py-1">
                  <Badge variant="secondary" className="text-xs">E</Badge>
                </div>
              )}
            </div>
          ))}

          {/* Add Condition Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onAddCondition}
            className="w-full gap-2"
          >
            <Plus className="h-3 w-3" />
            Adicionar Condição
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}