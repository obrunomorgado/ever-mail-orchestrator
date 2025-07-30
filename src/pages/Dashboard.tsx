import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { useNavigate } from "react-router-dom"
import { AlertTriangle, TrendingUp, Mail, DollarSign, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/DataContext"
import { useIsMobile } from "@/hooks/use-mobile"

// Dados demo
const volumeData = [
  { hour: '00h', volume: 120000 },
  { hour: '03h', volume: 80000 },
  { hour: '06h', volume: 250000 },
  { hour: '09h', volume: 450000 },
  { hour: '12h', volume: 380000 },
  { hour: '15h', volume: 320000 },
  { hour: '18h', volume: 280000 },
  { hour: '21h', volume: 180000 },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { totalContacts, dailyRevenue, avgERP, globalSpamRate, audiences, loading } = useData()
  const isMobile = useIsMobile()

  const kpiData = {
    enviosHoje: Math.floor(totalContacts * 0.8), // 80% of contacts sent today
    eRPMedio: avgERP,
    spamRate: globalSpamRate,
    receitaTotal: dailyRevenue,
    metaDiaria: 3000000,
  }

  const progressPercentage = (kpiData.enviosHoje / kpiData.metaDiaria) * 100
  const isSpamHigh = kpiData.spamRate > 0.1

  const handleOpenPlanner = () => {
    toast({
      title: "Navegando para o Planner",
      description: "Redirecionando para a grade de envios...",
    })
    navigate('/planner')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral dos seus envios hoje</p>
        </div>
        <Button onClick={handleOpenPlanner} size="lg" className="bg-primary hover:bg-primary/90">
          Open Planner
        </Button>
      </div>

      {/* Alert Banner - Spam Rate */}
      {isSpamHigh && (
        <div className="alert-banner flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>ATENÇÃO: Taxa de spam acima de 0,1% ({(kpiData.spamRate * 100).toFixed(2)}%) - Verificar reputação</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="kpi-label">Envios Hoje</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="kpi-value">{kpiData.enviosHoje.toLocaleString('pt-BR')}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={progressPercentage} className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Meta: {kpiData.metaDiaria.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="kpi-label">eRPM Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="kpi-value text-success">R$ {kpiData.eRPMedio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Por 1.000 entregues</p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="kpi-label">Spam Rate</CardTitle>
            <AlertCircle className={`h-4 w-4 ${isSpamHigh ? 'text-destructive' : 'text-success'}`} />
          </CardHeader>
          <CardContent>
            <div className={`kpi-value ${isSpamHigh ? 'text-destructive' : 'text-success'}`}>
              {(kpiData.spamRate * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Target: &lt; 0,10%</p>
          </CardContent>
        </Card>

        <Card className="kpi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="kpi-label">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="kpi-value text-accent">R$ {kpiData.receitaTotal.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Volume de Envios - Últimas 24h</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribuição de envios por horário
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/warm-up')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Warm-up Status</h3>
                <p className="text-sm text-muted-foreground">3 IPs em ramp-up ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/audiences')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-accent" />
              <div>
                <h3 className="font-semibold">Audiences Ativas</h3>
                <p className="text-sm text-muted-foreground">{audiences.length} listas, {(totalContacts / 1000000).toFixed(1)}M contatos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/guardrails')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-success" />
              <div>
                <h3 className="font-semibold">Guardrails</h3>
                <p className="text-sm text-muted-foreground">Tudo certo, chefia! ✓</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}