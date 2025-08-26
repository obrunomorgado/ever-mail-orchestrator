import { useState } from "react";
import { Check, User, MapPin, Smartphone, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { advancedFilters } from "@/mocks/segmentsData";
import type { AdvancedFilter } from "@/types/segments";

interface AdvancedFiltersProps {
  selected: AdvancedFilter[];
  onSelectionChange: (filters: AdvancedFilter[]) => void;
}

const categoryIcons = {
  attributes: User,
  location: MapPin,
  device: Smartphone,
  engagement: TrendingUp
};

const categoryColors = {
  attributes: "bg-blue-100 text-blue-800",
  location: "bg-green-100 text-green-800",
  device: "bg-purple-100 text-purple-800",
  engagement: "bg-orange-100 text-orange-800"
};

const categoryDescriptions = {
  attributes: "Dados pessoais e profissionais do contato",
  location: "Informações geográficas e regionais",
  device: "Dispositivos e clientes de email utilizados", 
  engagement: "Métricas de comportamento e interação"
};

export function AdvancedFilters({ selected, onSelectionChange }: AdvancedFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "attributes", "location", "device", "engagement"];

  const filteredFilters = advancedFilters.filter(filter => {
    const matchesSearch = filter.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || filter.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filtersByCategory = categories.slice(1).reduce((acc, category) => {
    acc[category] = advancedFilters.filter(filter => filter.category === category);
    return acc;
  }, {} as Record<string, AdvancedFilter[]>);

  const toggleFilter = (filter: AdvancedFilter) => {
    const isSelected = selected.some(f => f.id === filter.id);
    if (isSelected) {
      onSelectionChange(selected.filter(f => f.id !== filter.id));
    } else {
      onSelectionChange([...selected, filter]);
    }
  };

  const isSelected = (filterId: string) => {
    return selected.some(f => f.id === filterId);
  };

  const FilterCard = ({ filter }: { filter: AdvancedFilter }) => {
    const Icon = categoryIcons[filter.category];
    const selected = isSelected(filter.id);

    return (
      <Card
        key={filter.id}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selected && "ring-2 ring-primary bg-primary/5"
        )}
        onClick={() => toggleFilter(filter)}
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
                <CardTitle className="text-sm">{filter.name}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn("mt-1 text-xs", categoryColors[filter.category])}
                >
                  {filter.category}
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
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                Campo: {filter.field}
              </div>
              <Badge variant="secondary" className="text-xs">
                {filter.type}
              </Badge>
              {filter.options && (
                <div className="text-xs text-muted-foreground">
                  {filter.options.length} opções disponíveis
                </div>
              )}
            </div>
            <Button
              variant={selected ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                toggleFilter(filter);
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
          placeholder="Buscar filtros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Selected Filters Summary */}
      {selected.length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Filtros Selecionados ({selected.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selected.map((filter) => (
              <Badge key={filter.id} variant="default">
                {filter.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="attributes">Atributos</TabsTrigger>
          <TabsTrigger value="location">Localização</TabsTrigger>
          <TabsTrigger value="device">Dispositivo</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFilters.map((filter) => (
              <FilterCard key={filter.id} filter={filter} />
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
              {filtersByCategory[category].map((filter) => (
                <FilterCard key={filter.id} filter={filter} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {filteredFilters.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum filtro encontrado para "{searchTerm}"</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectionChange(advancedFilters)}
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