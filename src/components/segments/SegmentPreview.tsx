import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SegmentSource, SegmentEvent, AdvancedFilter, SegmentCard } from "@/types/segments";

interface SegmentPreviewProps {
  name: string;
  description: string;
  sources: SegmentSource[];
  events: SegmentEvent[];
  filters: AdvancedFilter[];
  cards: SegmentCard[];
  logic: "AND" | "OR";
  estimatedSize: number;
}

export function SegmentPreview({ 
  name, 
  description, 
  sources, 
  events, 
  filters, 
  cards, 
  logic, 
  estimatedSize 
}: SegmentPreviewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{name || "Segmento sem nome"}</CardTitle>
          <CardDescription>{description || "Nenhuma descrição"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2">Fontes ({sources.length})</div>
              <div className="flex flex-wrap gap-1">
                {sources.map(source => (
                  <Badge key={source.id} variant="outline">{source.name}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Tamanho Estimado</div>
              <div className="text-2xl font-bold">{estimatedSize.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}