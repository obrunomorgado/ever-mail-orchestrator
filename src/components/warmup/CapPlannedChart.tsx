import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CapChartData {
  day: string;
  planned: number;
  delivered: number;
}

interface CapPlannedChartProps {
  data: CapChartData[];
}

export function CapPlannedChart({ data }: CapPlannedChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Cap Planejado vs Entregues (Últimos 7 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip
              labelStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px"
              }}
            />
            <Bar 
              dataKey="delivered" 
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
              name="Entregues"
            />
            <Line 
              type="monotone" 
              dataKey="planned" 
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 4 }}
              name="Planejado"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}