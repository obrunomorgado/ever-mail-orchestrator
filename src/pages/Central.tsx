import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Mail, 
  Target,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Globe
} from "lucide-react";
import { centralMockData } from "@/mocks/centralData";

export default function Central() {
  const [period, setPeriod] = useState("7d");
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  const { kpis, campaigns, segments, deliverability, roiByChannel, suggestedActions } = centralMockData;

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getPerformanceColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value >= threshold.good) return "text-green-600";
    if (value >= threshold.warning) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔍 Central</h1>
          <p className="text-muted-foreground">Engajamento, receita e reputação. Tudo num lugar só.</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className={`flex items-center gap-1 text-sm ${kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(kpi.trend)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campanhas Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg">
                    <div 
                      className="p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                    >
                      <div className="grid grid-cols-6 gap-4 items-center text-sm">
                        <div className="flex items-center gap-2">
                          {campaign.alert && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                          <span className="font-medium">{campaign.name}</span>
                        </div>
                        <div>{campaign.sent.toLocaleString()}</div>
                        <div>{formatPercentage(campaign.openRate)}</div>
                        <div>{formatPercentage(campaign.clickRate)}</div>
                        <div className={campaign.roi > 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercentage(campaign.roi)}
                        </div>
                        <div className="font-medium">{formatCurrency(campaign.rpme)}</div>
                      </div>
                    </div>
                    
                    {expandedCampaign === campaign.id && (
                      <div className="p-4 border-t bg-muted/20">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium mb-2">Por Horário</h4>
                            <div className="space-y-1">
                              {campaign.hourlyPerformance.map((hour, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{hour.hour}</span>
                                  <span>{formatPercentage(hour.clickRate)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Por Provedor</h4>
                            <div className="space-y-1">
                              {campaign.providerPerformance.map((provider) => (
                                <div key={provider.provider} className="flex justify-between">
                                  <span>{provider.provider}</span>
                                  <span>{formatPercentage(provider.deliveryRate)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Detalhes</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div>Enviado: {new Date(campaign.sentAt).toLocaleDateString()}</div>
                              <div>Receita Est.: {formatCurrency(campaign.estimatedRevenue)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 px-4">
                <span>Campanha</span>
                <span>Enviados</span>
                <span>Abertura</span>
                <span>Cliques</span>
                <span>ROI</span>
                <span>RPME</span>
              </div>
            </CardContent>
          </Card>

          {/* Segmentos */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Segmentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {segments.map((segment) => (
                  <div key={segment.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: segment.color }}
                      />
                      <div>
                        <div className="font-medium">{segment.name}</div>
                        <div className="text-xs text-muted-foreground">{segment.lastAction}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-right">
                      <div>{segment.leads.toLocaleString()}</div>
                      <div>{formatPercentage(segment.clickRate)}</div>
                      <div>{formatCurrency(segment.revenue)}</div>
                      <div className="font-medium">{formatCurrency(segment.valuePerLead)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end text-xs text-muted-foreground mt-2 grid grid-cols-4 gap-4">
                <span>Leads</span>
                <span>Cliques %</span>
                <span>Receita</span>
                <span>Valor/Lead</span>
              </div>
            </CardContent>
          </Card>

          {/* Diagnóstico de Entregabilidade */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico de Entregabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deliverability.map((provider) => (
                  <div key={provider.provider} className="grid grid-cols-5 gap-4 items-center p-3 border rounded-lg text-sm">
                    <div className="font-medium">{provider.provider}</div>
                    <div>{formatPercentage(provider.deliveryRate)}</div>
                    <div className={getPerformanceColor(provider.bounceRate, { good: 2, warning: 5 })}>
                      {formatPercentage(provider.bounceRate)}
                    </div>
                    <div className={getPerformanceColor(provider.openRate, { good: 20, warning: 15 })}>
                      {formatPercentage(provider.openRate)}
                    </div>
                    <div className={getPerformanceColor(provider.complaintRate, { good: 0.1, warning: 0.3 })}>
                      {formatPercentage(provider.complaintRate)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Provedor</span>
                <span>Entregues</span>
                <span>Bounce</span>
                <span>Abertura</span>
                <span>Reclamação</span>
              </div>
            </CardContent>
          </Card>

          {/* ROI por Origem */}
          <Card>
            <CardHeader>
              <CardTitle>ROI por Canal de Aquisição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roiByChannel.map((channel) => (
                  <div key={channel.channel} className="grid grid-cols-5 gap-4 items-center p-3 border rounded-lg text-sm">
                    <div className="font-medium">{channel.channel}</div>
                    <div>{channel.leads.toLocaleString()}</div>
                    <div>{formatCurrency(channel.costPerLead)}</div>
                    <div>{formatCurrency(channel.revenue)}</div>
                    <div className={channel.roi > 0 ? 'text-green-600 font-medium' : 'text-red-600'}>
                      {formatPercentage(channel.roi)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Canal</span>
                <span>Leads</span>
                <span>Custo/Lead</span>
                <span>Receita</span>
                <span>ROI %</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Ações Sugeridas */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Ações Sugeridas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedActions.map((action, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-2">
                    <action.icon className={`h-4 w-4 mt-0.5 ${action.priority === 'high' ? 'text-red-500' : action.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                      <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                        {action.actionLabel}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}