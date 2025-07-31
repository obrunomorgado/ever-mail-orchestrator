import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { rfmMatrix, segments } from "@/mocks/demoData";
import { BarChart3, Users, TrendingUp, Target } from "lucide-react";

export function RFMAnalysisPage() {
  const totalCustomers = rfmMatrix.reduce((sum, segment) => sum + segment.count, 0);

  const getSegmentPercentage = (count: number) => (count / totalCustomers) * 100;

  const segmentStats = rfmMatrix.reduce((acc, segment) => {
    if (!acc[segment.segment]) {
      acc[segment.segment] = { count: 0, color: segment.color };
    }
    acc[segment.segment].count += segment.count;
    return acc;
  }, {} as Record<string, { count: number; color: string }>);

  const topSegments = Object.entries(segmentStats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Análise RFM</h1>
            <p className="text-muted-foreground">
              Segmentação por Recência, Frequência e Valor Monetário
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Target className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm font-medium">Total de Clientes</div>
            </div>
            <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div className="text-sm font-medium">Champions</div>
            </div>
            <div className="text-2xl font-bold">
              {segmentStats["Champions"]?.count.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {getSegmentPercentage(segmentStats["Champions"]?.count || 0).toFixed(1)}% do total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div className="text-sm font-medium">Loyal Customers</div>
            </div>
            <div className="text-2xl font-bold">
              {segmentStats["Loyal Customers"]?.count.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {getSegmentPercentage(segmentStats["Loyal Customers"]?.count || 0).toFixed(1)}% do total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              <div className="text-sm font-medium">At Risk</div>
            </div>
            <div className="text-2xl font-bold">
              {segmentStats["At Risk"]?.count.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {getSegmentPercentage(segmentStats["At Risk"]?.count || 0).toFixed(1)}% do total
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matriz RFM</CardTitle>
            <CardDescription>Distribuição visual dos clientes por segmento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-1">
              {[5, 4, 3, 2, 1].map(frequency => (
                [5, 4, 3, 2, 1].map(recency => {
                  const cell = rfmMatrix.find(item => 
                    item.frequency === frequency && item.recency === recency
                  );
                  return (
                    <div
                      key={`${frequency}-${recency}`}
                      className="aspect-square border rounded flex items-center justify-center text-xs p-1"
                      style={{ 
                        backgroundColor: cell ? `${cell.color}20` : '#f3f4f6',
                        borderColor: cell?.color || '#e5e7eb'
                      }}
                      title={cell ? `${cell.segment}: ${cell.count.toLocaleString()}` : 'Sem dados'}
                    >
                      {cell ? Math.round(getSegmentPercentage(cell.count)) + '%' : '-'}
                    </div>
                  );
                })
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Frequência: 1 (baixa) → 5 (alta)</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Recência: 1 (antiga) → 5 (recente)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Segmentos</CardTitle>
            <CardDescription>Maiores grupos de clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSegments.map((segment, index) => (
              <div key={segment.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="font-medium">{segment.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{segment.count.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {getSegmentPercentage(segment.count).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <Progress 
                  value={getSegmentPercentage(segment.count)} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estratégias Recomendadas por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <Badge variant="default">Champions</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Manter satisfação</p>
                <p><strong>Ações:</strong> Programa VIP, early access, upsell</p>
                <p><strong>Frequência:</strong> Semanal</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <Badge variant="default">Loyal Customers</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Elevar para Champions</p>
                <p><strong>Ações:</strong> Cross-sell, produtos premium</p>
                <p><strong>Frequência:</strong> Quinzenal</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-cyan-500" />
                <Badge variant="default">New Customers</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Onboarding eficaz</p>
                <p><strong>Ações:</strong> Tutorial, suporte, segunda compra</p>
                <p><strong>Frequência:</strong> Diária (primeiro mês)</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <Badge variant="destructive">At Risk</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Reativação urgente</p>
                <p><strong>Ações:</strong> Desconto, pesquisa, suporte</p>
                <p><strong>Frequência:</strong> Semanal (personalizada)</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-gray-700" />
                <Badge variant="secondary">Lost</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Win-back campaign</p>
                <p><strong>Ações:</strong> Oferta especial, novos produtos</p>
                <p><strong>Frequência:</strong> Mensal (limitada)</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-purple-500" />
                <Badge variant="secondary">Potential Loyalists</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Aumentar frequência</p>
                <p><strong>Ações:</strong> Programa de fidelidade, incentivos</p>
                <p><strong>Frequência:</strong> Bi-semanal</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}