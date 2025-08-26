import { useState } from "react";
import { Check, Mail, Workflow, Users, Tag, FileText, Link } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { segmentSources } from "@/mocks/segmentsData";
import type { SegmentSource } from "@/types/segments";

interface SegmentSourcesProps {
  selected: SegmentSource[];
  onSelectionChange: (sources: SegmentSource[]) => void;
}

const iconMap = {
  Mail,
  Workflow,
  Users,
  Tag,
  FileText,
  Link
};

export function SegmentSources({ selected, onSelectionChange }: SegmentSourcesProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSources = segmentSources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSource = (source: SegmentSource) => {
    const isSelected = selected.some(s => s.id === source.id);
    if (isSelected) {
      onSelectionChange(selected.filter(s => s.id !== source.id));
    } else {
      onSelectionChange([...selected, source]);
    }
  };

  const isSelected = (sourceId: string) => {
    return selected.some(s => s.id === sourceId);
  };

  return (
    <div className="space-y-4">
      {/* Selected Sources Summary */}
      {selected.length > 0 && (
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Fontes Selecionadas ({selected.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selected.map((source) => (
              <Badge key={source.id} variant="default">
                {source.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map((source) => {
          const Icon = iconMap[source.icon as keyof typeof iconMap];
          const selected = isSelected(source.id);

          return (
            <Card
              key={source.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selected && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => toggleSource(source)}
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
                    <CardTitle className="text-sm">{source.name}</CardTitle>
                  </div>
                  {selected && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {source.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {source.type}
                  </Badge>
                  <Button
                    variant={selected ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSource(source);
                    }}
                  >
                    {selected ? "Selecionado" : "Selecionar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSources.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma fonte encontrada para "{searchTerm}"</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectionChange(segmentSources)}
        >
          Selecionar Todas
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