import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProviderData {
  provider: string;
  share: number;
  state?: "verde" | "amarelo" | "vermelho";
}

interface ProviderSplitChartProps {
  data: ProviderData[];
  type?: "pie" | "bar";
}

const PROVIDER_COLORS = {
  Gmail: "hsl(var(--primary))",
  Outlook: "hsl(var(--info))", 
  Yahoo: "hsl(var(--warning))",
  Outros: "hsl(var(--accent))"
};

const getProviderColor = (provider: string, state?: string) => {
  if (state === "vermelho") return "hsl(var(--destructive))";
  if (state === "amarelo") return "hsl(var(--warning))";
  return PROVIDER_COLORS[provider as keyof typeof PROVIDER_COLORS] || "hsl(var(--muted))";
};

export function ProviderSplitChart({ data, type = "pie" }: ProviderSplitChartProps) {
  const chartData = data.map(item => ({
    ...item,
    percentage: (item.share * 100).toFixed(1),
    color: getProviderColor(item.provider, item.state)
  }));

  if (type === "bar") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Split por Provedor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="provider" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Share"]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
              <Bar dataKey="percentage" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Split por Provedor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="60%" height={150}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                dataKey="percentage"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, "Share"]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="flex-1 space-y-2">
            {chartData.map((item) => (
              <div key={item.provider} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.provider}</span>
                </div>
                <span className="font-medium">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}