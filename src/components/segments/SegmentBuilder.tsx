import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SegmentSources } from "./SegmentSources";
import { AdvancedEventTypes } from "./AdvancedEventTypes";
import { AdvancedFilters } from "./AdvancedFilters";
import { VisualBuilder } from "./VisualBuilder";
import { SegmentPreview } from "./SegmentPreview";
import { useToast } from "@/hooks/use-toast";
import type { SegmentSource, SegmentEvent, AdvancedFilter, SegmentCard } from "@/types/segments";

interface SegmentBuilderProps {
  onClose: () => void;
}

export function SegmentBuilder({ onClose }: SegmentBuilderProps) {
  const { toast } = useToast();
  const [segmentName, setSegmentName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSources, setSelectedSources] = useState<SegmentSource[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<SegmentEvent[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<AdvancedFilter[]>([]);
  const [cards, setCards] = useState<SegmentCard[]>([]);
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [estimatedSize, setEstimatedSize] = useState(0);

  const handleSave = () => {
    if (!segmentName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para o segmento.",
        variant: "destructive",
      });
      return;
    }

    if (cards.length === 0) {
      toast({
        title: "Condições obrigatórias",
        description: "Adicione pelo menos uma condição ao segmento.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Segmento criado",
      description: `O segmento "${segmentName}" foi criado com sucesso.`,
    });

    onClose();
  };

  const handleDryRun = () => {
    // Simular cálculo de tamanho estimado
    const baseSize = Math.floor(Math.random() * 20000) + 1000;
    setEstimatedSize(baseSize);
    
    toast({
      title: "Simulação concluída",
      description: `Tamanho estimado: ${baseSize.toLocaleString()} contatos`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="segment-name">Nome do Segmento</Label>
            <Input
              id="segment-name"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="Ex: Usuários VIP"
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste segmento..."
            />
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{selectedSources.length} fontes</Badge>
            <Badge variant="outline">{selectedEvents.length} eventos</Badge>
            <Badge variant="outline">{selectedFilters.length} filtros</Badge>
            <Badge variant="outline">{cards.length} condições</Badge>
          </div>
          {estimatedSize > 0 && (
            <div className="text-primary font-medium">
              Tamanho estimado: {estimatedSize.toLocaleString()} contatos
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sources">Fontes</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="filters">Filtros</TabsTrigger>
          <TabsTrigger value="builder">Construtor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Fontes de Segmentação</CardTitle>
              <CardDescription>
                Selecione as origens de dados para construir seu segmento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentSources
                selected={selectedSources}
                onSelectionChange={setSelectedSources}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Eventos</CardTitle>
              <CardDescription>
                Escolha os eventos comportamentais para segmentação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedEventTypes
                selected={selectedEvents}
                onSelectionChange={setSelectedEvents}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filters">
          <Card>
            <CardHeader>
              <CardTitle>Filtros Avançados</CardTitle>
              <CardDescription>
                Aplique filtros por atributos, localização e dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedFilters
                selected={selectedFilters}
                onSelectionChange={setSelectedFilters}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Construtor Visual</CardTitle>
              <CardDescription>
                Monte as condições do seu segmento visualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VisualBuilder
                cards={cards}
                onCardsChange={setCards}
                logic={logic}
                onLogicChange={setLogic}
                availableEvents={selectedEvents}
                availableFilters={selectedFilters}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview do Segmento</CardTitle>
              <CardDescription>
                Visualize como ficará seu segmento antes de salvar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SegmentPreview
                name={segmentName}
                description={description}
                sources={selectedSources}
                events={selectedEvents}
                filters={selectedFilters}
                cards={cards}
                logic={logic}
                estimatedSize={estimatedSize}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleDryRun}>
          Simular Tamanho
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Criar Segmento
          </Button>
        </div>
      </div>
    </div>
  );
}