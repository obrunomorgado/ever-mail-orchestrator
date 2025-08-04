import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { engagementMatrix, segments } from "@/mocks/demoData";
import { BarChart3, Users, TrendingUp, Target, Mail, MousePointer, Eye, DollarSign } from "lucide-react";

export function EngagementAnalysisPage() {
  const totalSubscribers = engagementMatrix.reduce((sum, segment) => sum + segment.count, 0);

  const getSegmentPercentage = (count: number) => (count / totalSubscribers) * 100;

  const segmentStats = engagementMatrix.reduce((acc, segment) => {
    if (!acc[segment.segment]) {
      acc[segment.segment] = { count: 0, color: segment.color, erpm: segment.erpm };
    }
    acc[segment.segment].count += segment.count;
    return acc;
  }, {} as Record<string, { count: number; color: string; erpm: number }>);

  const topSegments = Object.entries(segmentStats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const overallErpm = (segmentStats["VIP Subscribers"]?.erpm || 0) * 0.4 + 
                     (segmentStats["Active Readers"]?.erpm || 0) * 0.3 + 
                     (segmentStats["Casual Readers"]?.erpm || 0) * 0.2 + 
                     (segmentStats["Inactive"]?.erpm || 0) * 0.1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Análise de Engajamento</h1>
            <p className="text-muted-foreground">
              Performance da audiência por nível de interação e receita
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
              <div className="text-sm font-medium">Total Subscribers</div>
            </div>
            <div className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <div className="text-sm font-medium">VIP Subscribers</div>
            </div>
            <div className="text-2xl font-bold">
              {segmentStats["VIP Subscribers"]?.count.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {getSegmentPercentage(segmentStats["VIP Subscribers"]?.count || 0).toFixed(1)}% do total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              <div className="text-sm font-medium">Active Readers</div>
            </div>
            <div className="text-2xl font-bold">
              {segmentStats["Active Readers"]?.count.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {getSegmentPercentage(segmentStats["Active Readers"]?.count || 0).toFixed(1)}% do total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div className="text-sm font-medium">eRPM Médio</div>
            </div>
            <div className="text-2xl font-bold">
              R$ {overallErpm.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Receita por mil subscribers
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Engajamento</CardTitle>
            <CardDescription>Distribuição por taxa de abertura vs. taxa de clique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-1">
              {[5, 4, 3, 2, 1].map(openRate => (
                [5, 4, 3, 2, 1].map(clickRate => {
                  const cell = engagementMatrix.find(item => 
                    item.openRate === openRate && item.clickRate === clickRate
                  );
                  return (
                    <div
                      key={`${openRate}-${clickRate}`}
                      className="aspect-square border rounded flex items-center justify-center text-xs p-1"
                      style={{ 
                        backgroundColor: cell ? `${cell.color}20` : '#f3f4f6',
                        borderColor: cell?.color || '#e5e7eb'
                      }}
                      title={cell ? `${cell.segment}: ${cell.count.toLocaleString()} (eRPM: R$ ${cell.erpm})` : 'Sem dados'}
                    >
                      {cell ? Math.round(getSegmentPercentage(cell.count)) + '%' : '-'}
                    </div>
                  );
                })
              ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Taxa de Clique: 1 (baixa) → 5 (alta)</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Taxa de Abertura: 1 (baixa) → 5 (alta)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Segmentos de Engajamento</CardTitle>
            <CardDescription>Grupos com melhor performance</CardDescription>
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
                      eRPM: R$ {segment.erpm}
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
          <CardTitle>Estratégias por Segmento de Engajamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <Badge variant="default">VIP Subscribers</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Conteúdo premium exclusivo</p>
                <p><strong>Ações:</strong> Early access, análises exclusivas, webinars VIP</p>
                <p><strong>Frequência:</strong> Diária</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <Badge variant="default">Active Readers</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Elevar para VIP</p>
                <p><strong>Ações:</strong> Conteúdo de valor, produtos premium</p>
                <p><strong>Frequência:</strong> 2-3x por semana</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-cyan-500" />
                <Badge variant="default">New Subscribers</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Onboarding eficaz</p>
                <p><strong>Ações:</strong> Série de boas-vindas, conteúdo introdutório</p>
                <p><strong>Frequência:</strong> Diária (primeira semana)</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <Badge variant="secondary">Casual Readers</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Aumentar engajamento</p>
                <p><strong>Ações:</strong> Conteúdo personalizado, horários otimizados</p>
                <p><strong>Frequência:</strong> 2x por semana</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <Badge variant="destructive">Inactive</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Reativação</p>
                <p><strong>Ações:</strong> Conteúdo especial, pesquisa de interesse</p>
                <p><strong>Frequência:</strong> Semanal (campanha específica)</p>
              </div>
            </div>

            <div className="p-4 border rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded bg-gray-700" />
                <Badge variant="secondary">Lost Subscribers</Badge>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Estratégia:</strong> Win-back ou limpeza</p>
                <p><strong>Ações:</strong> Última tentativa, remoção da lista</p>
                <p><strong>Frequência:</strong> Quinzenal (limitada)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}