import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { 
  TrendingUp, 
  TrendingDown, 
  Pause, 
  Download, 
  MessageSquare, 
  Calendar, 
  FileText,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { SemaforoBadge } from "./SemaforoBadge";
import { MetricCard } from "./MetricCard";
import { ProviderSplitChart } from "./ProviderSplitChart";
import { CapPlannedChart } from "./CapPlannedChart";
import { ChecklistItem } from "./ChecklistItem";
import { DecisionModal } from "./DecisionModal";
import { DiscordStatusModal } from "./DiscordStatusModal";

import { 
  metrics7d, 
  getProviderStates, 
  calculateNewCap, 
  getCapChartData, 
  dailyChecklist, 
  actionMicrocopy,
  providerShare30d
} from "@/data/warmupData";

interface DashboardProps {
  projectName: string;
  onViewPlan: () => void;
  onViewTemplates: () => void;
}

export function Dashboard({ projectName, onViewPlan, onViewTemplates }: DashboardProps) {
  const { toast } = useToast();
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [discordModalOpen, setDiscordModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"avançar" | "manter" | "recuar" | "pausar">("avançar");

  // Estados e métricas atuais
  const providerStates = getProviderStates();
  const currentCap = 3900; // Cap atual (dia 13 da rampa)
  
  // Calcular estado geral
  const hasRedState = Object.values(providerStates).includes("vermelho");
  const hasYellowState = Object.values(providerStates).includes("amarelo");
  const generalState = hasRedState ? "vermelho" : hasYellowState ? "amarelo" : "verde";

  // Métricas de hoje consolidadas
  const todayMetrics = {
    spam: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-1)[0].spam, 0) / 4,
    bounce: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-1)[0].bounce, 0) / 4,
    hard: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-1)[0].hard, 0) / 4,
    fivexx: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-1)[0].f5xx, 0) / 4,
    open: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-1)[0].open, 0) / 4,
    click: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-1)[0].click, 0) / 4,
    delivered: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-1)[0].delivered, 0)
  };

  // Métricas de ontem para cálculo de delta
  const yesterdayMetrics = {
    spam: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-2)[0].spam, 0) / 4,
    bounce: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-2)[0].bounce, 0) / 4,
    hard: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-2)[0].hard, 0) / 4,
    fivexx: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-2)[0].f5xx, 0) / 4,
    open: Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-2)[0].open, 0) / 4
  };

  // Determinar ação recomendada baseada no estado geral
  const getRecommendedAction = () => {
    if (generalState === "verde") return "avançar";
    if (generalState === "amarelo") return "manter";
    return "recuar";
  };

  const recommendedAction = getRecommendedAction();
  const newCap = calculateNewCap(currentCap, generalState);

  const handleActionClick = (action: "avançar" | "manter" | "recuar" | "pausar") => {
    setSelectedAction(action);
    setDecisionModalOpen(true);
  };

  const handleApplyAction = () => {
    setDecisionModalOpen(false);
    toast({
      title: "Ajuste aplicado!",
      description: `Ação "${selectedAction}" foi aplicada com sucesso ao seu plano de warmup.`
    });
  };

  const handleExportCSV = () => {
    toast({
      title: "CSV exportado!",
      description: "Os dados foram exportados para warmup_metrics.csv"
    });
  };

  const handleDiscordStatus = () => {
    setDiscordModalOpen(true);
  };

  // Dados para gráficos
  const capChartData = getCapChartData();
  const providerChartData = providerShare30d.map(item => ({
    ...item,
    state: providerStates[item.provider]
  }));

  return (
    <div className="space-y-6">
      {/* Header com Breadcrumb */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">EverInbox</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/warmup">Warmup</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{projectName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Chips por provedor */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(providerStates).map(([provider, state]) => {
            const share = providerShare30d.find(p => p.provider === provider)?.share || 0;
            return (
              <div key={provider} className="flex items-center gap-2">
                <SemaforoBadge state={state} />
                <span className="text-sm text-muted-foreground">
                  {provider} ({(share * 100).toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cards de Saúde */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Spam"
          value={(todayMetrics.spam * 100).toFixed(3)}
          suffix="%"
          delta={(todayMetrics.spam - yesterdayMetrics.spam) * 100}
        />
        <MetricCard
          title="Bounce"
          value={todayMetrics.bounce.toFixed(1)}
          suffix="%"
          delta={todayMetrics.bounce - yesterdayMetrics.bounce}
        />
        <MetricCard
          title="Hard Bounce"
          value={todayMetrics.hard.toFixed(2)}
          suffix="%"
          delta={todayMetrics.hard - yesterdayMetrics.hard}
        />
        <MetricCard
          title="5xx/Blocks"
          value={todayMetrics.fivexx.toFixed(1)}
          suffix="%"
          delta={todayMetrics.fivexx - yesterdayMetrics.fivexx}
        />
        <MetricCard
          title="Opens Únicos"
          value={todayMetrics.open.toFixed(1)}
          suffix="%"
          delta={todayMetrics.open - yesterdayMetrics.open}
        />
        <MetricCard
          title="Entregues"
          value={todayMetrics.delivered.toLocaleString()}
          delta={todayMetrics.delivered - Object.values(metrics7d).reduce((sum, provider) => sum + provider.slice(-2)[0].delivered, 0)}
        />
      </div>

      {/* Gráfico Cap Planejado vs Entregues */}
      <CapPlannedChart data={capChartData} />

      {/* Ação Recomendada */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {recommendedAction === "avançar" && <TrendingUp className="w-5 h-5 text-success" />}
            {recommendedAction === "manter" && <Pause className="w-5 h-5 text-warning" />}
            {recommendedAction === "recuar" && <TrendingDown className="w-5 h-5 text-destructive" />}
            Ação Recomendada: 
            <SemaforoBadge state={generalState} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {actionMicrocopy[recommendedAction]}
          </p>
          
          <div className="flex items-center gap-2 text-sm">
            <span>Cap atual: <strong>{currentCap.toLocaleString()}</strong></span>
            <span>→</span>
            <span>Cap sugerido: <strong>{newCap.toLocaleString()}</strong></span>
            <Badge variant={recommendedAction === "avançar" ? "default" : "secondary"}>
              {((newCap - currentCap) / currentCap * 100).toFixed(1)}%
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleActionClick("avançar")}
              variant={recommendedAction === "avançar" ? "default" : "outline"}
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Avançar +25%
            </Button>
            <Button
              onClick={() => handleActionClick("manter")}
              variant={recommendedAction === "manter" ? "default" : "outline"}
              size="sm"
            >
              <Pause className="w-4 h-4 mr-2" />
              Manter
            </Button>
            <Button
              onClick={() => handleActionClick("recuar")}
              variant={recommendedAction === "recuar" ? "default" : "outline"}
              size="sm"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Recuar -30%
            </Button>
            {Object.values(providerStates).includes("vermelho") && (
              <Button
                onClick={() => handleActionClick("pausar")}
                variant="destructive"
                size="sm"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Pausar Provedor
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Split por Provedor */}
        <ProviderSplitChart data={providerChartData} />

        {/* Checklist Diário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Checklist Diário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dailyChecklist.map((item, index) => (
              <ChecklistItem
                key={index}
                label={item}
                defaultChecked={Math.random() > 0.3} // Mock some as checked
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Botões de Utilidade */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
        <Button variant="outline" onClick={handleDiscordStatus}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Copiar status p/ Discord
        </Button>
        <Button variant="outline" onClick={onViewPlan}>
          <Calendar className="w-4 h-4 mr-2" />
          Ver Plano (Rampa)
        </Button>
        <Button variant="outline" onClick={onViewTemplates}>
          <FileText className="w-4 h-4 mr-2" />
          Templates de Conteúdo
        </Button>
      </div>

      {/* Modais */}
      <DecisionModal
        open={decisionModalOpen}
        onOpenChange={setDecisionModalOpen}
        action={selectedAction}
        rationale={actionMicrocopy[selectedAction]}
        newCap={calculateNewCap(currentCap, selectedAction === "avançar" ? "verde" : selectedAction === "manter" ? "amarelo" : "vermelho")}
        currentCap={currentCap}
        metrics={todayMetrics}
        onApply={handleApplyAction}
      />

      <DiscordStatusModal
        open={discordModalOpen}
        onOpenChange={setDiscordModalOpen}
        data={{
          date: new Date().toLocaleDateString('pt-BR'),
          project: projectName,
          currentCap,
          gmailState: providerStates.Gmail as "verde" | "amarelo" | "vermelho",
          spamRate: todayMetrics.spam,
          bounceRate: todayMetrics.bounce,
          action: recommendedAction,
          newCap
        }}
      />
    </div>
  );
}