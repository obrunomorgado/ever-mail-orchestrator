import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Segment } from "@/types/segments";

interface SegmentComparisonProps {
  segments: Segment[];
}

export function SegmentComparison({ segments }: SegmentComparisonProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Segmentos</CardTitle>
          <CardDescription>Compare performance entre segmentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>Comparação em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}