import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3 } from "lucide-react";

interface VolumeData {
  day: string;
  totalVolume: number;
  ipVolume: number;
}

interface DailyVolumesChartProps {
  data: VolumeData[];
}

export function DailyVolumesChart({ data }: DailyVolumesChartProps) {
  const totalToday = data[data.length - 1]?.totalVolume || 0;
  const totalYesterday = data[data.length - 2]?.totalVolume || 0;
  const growth = totalYesterday > 0 ? ((totalToday - totalYesterday) / totalYesterday * 100) : 0;

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Envios Diários
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>
            {growth > 0 ? '+' : ''}{growth.toFixed(1)}% vs ontem
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === 'totalVolume' ? 'Volume Total' : 'Volume por IP'
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalVolume" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="Volume Total"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="ipVolume" 
                stroke="hsl(var(--accent))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Volume por IP"
                dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="kpi-value text-primary">
              {totalToday.toLocaleString()}
            </div>
            <div className="kpi-label">Volume Hoje</div>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-lg">
            <div className="kpi-value text-accent-foreground">
              {data[data.length - 1]?.ipVolume || 0}
            </div>
            <div className="kpi-label">Média por IP</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}