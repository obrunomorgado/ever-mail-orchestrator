import { useState } from "react";
import { Check, Mail, MousePointer, Ban, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { segmentEvents } from "@/mocks/segmentsData";
import type { SegmentEvent } from "@/types/segments";

interface AdvancedEventTypesProps {
  selected: SegmentEvent[];
  onSelectionChange: (events: SegmentEvent[]) => void;
}

const categoryIcons = {
  basic: Mail,
  negative: Ban,
  advanced: Clock,
  custom: Zap
};

const categoryColors = {
  basic: "bg-blue-100 text-blue-800",
  negative: "bg-red-100 text-red-800", 
  advanced: "bg-purple-100 text-purple-800",
  custom: "bg-green-100 text-green-800"
};

const categoryDescriptions = {
  basic: "Eventos fundamentais de email marketing",
  negative: "Eventos que indicam falta de engajamento",
  advanced: "Métricas avançadas e datas específicas",
  custom: "Eventos personalizados e integrações"
};

export function AdvancedEventTypes({ selected, onSelectionChange }: AdvancedEventTypesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "basic", "negative", "advanced", "custom"];

  const filteredEvents = segmentEvents.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const eventsByCategory = categories.slice(1).reduce((acc, category) => {
    acc[category] = segmentEvents.filter(event => event.category === category);
    return acc;
  }, {} as Record<string, SegmentEvent[]>);

  const toggleEvent = (event: SegmentEvent) => {
    const isSelected = selected.some(e => e.id === event.id);
    if (isSelected) {
      onSelectionChange(selected.filter(e => e.id !== event.id));
    } else {
      onSelectionChange([...selected, event]);
    }
  };

  const isSelected = (eventId: string) => {
    return selected.some(e => e.id === eventId);
  };

  const EventCard = ({ event }: { event: SegmentEvent }) => {
    const Icon = categoryIcons[event.category];
    const selected = isSelected(event.id);

    return (
      <Card
        key={event.id}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selected && "ring-2 ring-primary bg-primary/5"
        )}
        onClick={() => toggleEvent(event)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg",
                selected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm">{event.name}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn("mt-1 text-xs", categoryColors[event.category])}
                >
                  {event.category}
                </Badge>
              </div>
            </div>
            {selected && (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>
          <CardDescription className="text-xs mt-2">
            {event.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {event.operators.slice(0, 3).map((op) => (
                <Badge key={op} variant="secondary" className="text-xs">
                  {op}
                </Badge>
              ))}
              {event.operators.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.operators.length - 3}
                </Badge>
              )}
            </div>
            <Button
              variant={selected ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                toggleEvent(event);
              }}
            >
              {selected ? "Selecionado" : "Selecionar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Selected Events Summary */}
      {selected.length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Eventos Selecionados ({selected.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selected.map((event) => (
              <Badge key={event.id} variant="default">
                {event.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="basic">Básicos</TabsTrigger>
          <TabsTrigger value="negative">Negativos</TabsTrigger>
          <TabsTrigger value="advanced">Avançados</TabsTrigger>
          <TabsTrigger value="custom">Personalizados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        {categories.slice(1).map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium capitalize mb-1">{category}</h3>
              <p className="text-sm text-muted-foreground">
                {categoryDescriptions[category as keyof typeof categoryDescriptions]}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventsByCategory[category].map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum evento encontrado para "{searchTerm}"</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectionChange(segmentEvents)}
        >
          Selecionar Todos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectionChange([])}
        >
          Limpar Seleção
        </Button>
      </div>
    </div>
  );
}