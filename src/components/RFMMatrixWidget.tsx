import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { rfmMatrix } from "@/mocks/demoData";

interface RFMMatrixWidgetProps {
  segmentId?: string;
}

export function RFMMatrixWidget({ segmentId }: RFMMatrixWidgetProps) {
  const totalCustomers = rfmMatrix.reduce((sum, segment) => sum + segment.count, 0);
  const getSegmentPercentage = (count: number) => (count / totalCustomers) * 100;

  // Find RFM data for the specific segment if provided
  const segmentRFM = segmentId ? 
    rfmMatrix.find(item => item.segment.toLowerCase().includes(segmentId.toLowerCase())) :
    null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Análise RFM</CardTitle>
      </CardHeader>
      <CardContent>
        {segmentRFM ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: segmentRFM.color }}
              />
              <Badge variant="outline">{segmentRFM.segment}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-medium">{segmentRFM.recency}</div>
                <div className="text-muted-foreground">Recência</div>
              </div>
              <div>
                <div className="font-medium">{segmentRFM.frequency}</div>
                <div className="text-muted-foreground">Frequência</div>
              </div>
              <div>
                <div className="font-medium">{segmentRFM.monetary}</div>
                <div className="text-muted-foreground">Monetário</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{segmentRFM.count.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {getSegmentPercentage(segmentRFM.count).toFixed(1)}% do total
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Matriz RFM geral da base
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-lg font-bold">3.2</div>
                <div className="text-muted-foreground">Recência Média</div>
              </div>
              <div>
                <div className="text-lg font-bold">2.8</div>
                <div className="text-muted-foreground">Frequência Média</div>
              </div>
              <div>
                <div className="text-lg font-bold">3.1</div>
                <div className="text-muted-foreground">Monetário Médio</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{totalCustomers.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total de clientes</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}