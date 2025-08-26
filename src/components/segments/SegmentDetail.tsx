import { TrendingUp, Users, Download, RefreshCw, Zap, ArrowUp, ArrowDown, Eye, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from "recharts";

interface SegmentDetailProps {
  segment: any;
  onClose: () => void;
}

// Mock data para gráficos
const engagementData = [
  { date: "Jan", contacts: 12000, opened: 8400, clicked: 2880 },
  { date: "Fev", contacts: 11800, opened: 8260, clicked: 2832 },
  { date: "Mar", contacts: 12200, opened: 8540, clicked: 2928 },
  { date: "Abr", contacts: 12100, opened: 8470, clicked: 2904 },
  { date: "Mai", contacts: 12400, opened: 8680, clicked: 2976 },
  { date: "Jun", contacts: 12384, opened: 8669, clicked: 2971 }
];

const domainData = [
  { name: "Gmail", value: 45, count: 5573 },
  { name: "Outlook", value: 23, count: 2848 },
  { name: "Yahoo", value: 15, count: 1858 },
  { name: "Hotmail", value: 10, count: 1238 },
  { name: "Outros", value: 7, count: 867 }
];

const scoreData = [
  { name: "🔥 Quente", count: 4953, percentage: 40 },
  { name: "🌡️ Morno", count: 4446, percentage: 36 },
  { name: "❄️ Frio", count: 2985, percentage: 24 }
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export function SegmentDetail({ segment, onClose }: SegmentDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{segment.contacts.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total de Contatos</div>
                <div className="flex items-center gap-1 text-xs">
                  {segment.trend === "up" ? (
                    <ArrowUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={segment.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {segment.trendPercentage}% últimos 7d
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">68.4%</div>
                <div className="text-sm text-muted-foreground">Taxa de Abertura</div>
                <div className="text-xs text-green-600">+2.1% vs média</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">24.2%</div>
                <div className="text-sm text-muted-foreground">Taxa de Cliques</div>
                <div className="text-xs text-green-600">+1.8% vs média</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">R$ 89</div>
                <div className="text-sm text-muted-foreground">RPM Médio</div>
                <div className="text-xs text-purple-600">+R$ 12 vs geral</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condições aplicadas */}
      <Card>
        <CardHeader>
          <CardTitle>Condições do Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Aberturas ≥ 10 últimos 30d
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Tag contém "VIP"
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              E (todas as condições)
            </Badge>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex flex-wrap gap-2">
            {segment.sources.map((source: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                📊 {source}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Engajamento */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="opened" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Aberturas"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicked" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Cliques"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Domínio */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Domínio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={domainData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'Porcentagem']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score de Engajamento */}
        <Card>
          <CardHeader>
            <CardTitle>Níveis de Score</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2">
              <Download className="h-4 w-4" />
              Exportar Contatos (CSV)
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-2">
              <RefreshCw className="h-4 w-4" />
              Recalcular Segmento
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-2">
              <Zap className="h-4 w-4" />
              Criar Campanha com Este Segmento
            </Button>

            <Separator />

            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última atualização:</span>
                <span>há 2 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Próxima atualização:</span>
                <span>em 22 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em:</span>
                <span>15/01/2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}