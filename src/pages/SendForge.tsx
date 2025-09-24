import { mockSendForgeData, volumeChartData } from "@/mocks/sendForgeData";
import { ReputationStatusCard } from "@/components/sendforge/ReputationStatusCard";
import { DailyVolumesChart } from "@/components/sendforge/DailyVolumesChart";
import { EngagementMetricsCard } from "@/components/sendforge/EngagementMetricsCard";
import { CriticalAlertsBar } from "@/components/sendforge/CriticalAlertsBar";
import { DomainWarmupList } from "@/components/sendforge/DomainWarmupList";
import { HybridRepliesCard } from "@/components/sendforge/HybridRepliesCard";
import { LoadBalancerVisual } from "@/components/sendforge/LoadBalancerVisual";
import { IPKanbanBoard } from "@/components/sendforge/IPKanbanBoard";
import { KPIDashboard } from "@/components/sendforge/KPIDashboard";
import { ActivityLogTimeline } from "@/components/sendforge/ActivityLogTimeline";
import { UsageModesSelector } from "@/components/sendforge/UsageModesSelector";

export default function SendForge() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">SF</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">SendForge</h1>
            <p className="text-muted-foreground">
              Warm-Up & Multi-Domain/IP Orchestrator da EverInbox
            </p>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      <CriticalAlertsBar alerts={mockSendForgeData.alerts} />

      {/* Dashboard Overview - Grid 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ReputationStatusCard pools={mockSendForgeData.ipPools} />
        <DailyVolumesChart data={volumeChartData} />
        <EngagementMetricsCard metrics={mockSendForgeData.engagement} />
      </div>

      {/* Warm-Up & Replies - Grid 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DomainWarmupList domains={mockSendForgeData.domains} />
        <HybridRepliesCard 
          engagement={mockSendForgeData.engagement} 
          replyExamples={mockSendForgeData.replyExamples}
        />
      </div>

      {/* Load Balancer */}
      <LoadBalancerVisual config={mockSendForgeData.loadBalance} />

      {/* IP Management */}
      <IPKanbanBoard pools={mockSendForgeData.ipPools} />

      {/* Monitoring & Activity - Grid 3 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <KPIDashboard 
          kpis={mockSendForgeData.kpis} 
          alerts={mockSendForgeData.alerts}
        />
        <ActivityLogTimeline activityLog={mockSendForgeData.activityLog} />
      </div>

      {/* Usage Modes */}
      <UsageModesSelector modes={mockSendForgeData.usageModes} />

      {/* Footer Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-muted/30 rounded-lg">
        <div className="text-center space-y-1">
          <div className="text-2xl">📧</div>
          <div className="font-medium">Inbox Gmail Garantida</div>
          <div className="text-sm text-muted-foreground">Templates reais e autênticos</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl">⚡</div>
          <div className="font-medium">Escala Segura</div>
          <div className="text-sm text-muted-foreground">Multi-IP e multi-domínio</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl">🛡️</div>
          <div className="font-medium">Reputação Protegida</div>
          <div className="text-sm text-muted-foreground">Uso controlado 10-30%</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-2xl">🎯</div>
          <div className="font-medium">Flexibilidade Total</div>
          <div className="text-sm text-muted-foreground">DFY, Pre-Warmed, BYO</div>
        </div>
      </div>
    </div>
  );
}