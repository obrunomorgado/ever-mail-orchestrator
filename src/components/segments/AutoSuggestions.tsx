import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SegmentSuggestion } from "@/types/segments";

interface AutoSuggestionsProps {
  suggestions: SegmentSuggestion[];
}

export function AutoSuggestions({ suggestions }: AutoSuggestionsProps) {
  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                <CardDescription>{suggestion.description}</CardDescription>
              </div>
              <Badge variant="outline">{suggestion.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Tamanho Esperado</div>
                <div className="font-medium">{suggestion.expectedSize.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Impacto Potencial</div>
                <div className="font-medium">{suggestion.potentialImpact}</div>
              </div>
            </div>
            <Button>Aplicar Sugestão</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}