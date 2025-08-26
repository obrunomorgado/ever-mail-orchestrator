import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Segment } from "@/types/segments";

interface SegmentDashboardProps {
  segments: Segment[];
}

export function SegmentDashboard({ segments }: SegmentDashboardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Segmentos</CardTitle>
          <CardDescription>Análise geral dos seus segmentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>Dashboard em desenvolvimento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}