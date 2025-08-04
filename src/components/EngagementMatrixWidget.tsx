import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { engagementMatrix } from "@/mocks/demoData";

interface EngagementMatrixWidgetProps {
  segmentId?: string;
}

export function EngagementMatrixWidget({ segmentId }: EngagementMatrixWidgetProps) {
  const totalSubscribers = engagementMatrix.reduce((sum, segment) => sum + segment.count, 0);
  const getSegmentPercentage = (count: number) => (count / totalSubscribers) * 100;

  // Find engagement data for the specific segment if provided
  const segmentEngagement = segmentId ? 
    engagementMatrix.find(item => item.segment.toLowerCase().includes(segmentId.toLowerCase())) :
    null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Análise de Engajamento</CardTitle>
      </CardHeader>
      <CardContent>
        {segmentEngagement ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: segmentEngagement.color }}
              />
              <Badge variant="outline">{segmentEngagement.segment}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-medium">{segmentEngagement.openRate}</div>
                <div className="text-muted-foreground">Taxa Abertura</div>
              </div>
              <div>
                <div className="font-medium">{segmentEngagement.clickRate}</div>
                <div className="text-muted-foreground">Taxa Clique</div>
              </div>
              <div>
                <div className="font-medium">R$ {segmentEngagement.erpm}</div>
                <div className="text-muted-foreground">eRPM</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{segmentEngagement.count.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {getSegmentPercentage(segmentEngagement.count).toFixed(1)}% do total
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Engajamento geral da base
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-lg font-bold">3.2</div>
                <div className="text-muted-foreground">Taxa Abertura Média</div>
              </div>
              <div>
                <div className="text-lg font-bold">2.8</div>
                <div className="text-muted-foreground">Taxa Clique Média</div>
              </div>
              <div>
                <div className="text-lg font-bold">R$ 12.45</div>
                <div className="text-muted-foreground">eRPM Médio</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{totalSubscribers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total de subscribers</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}