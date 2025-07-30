import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dados demo
const warmupPhases = [
  {
    id: 1,
    name: 'Acelerada',
    days: '1-3',
    volumeStart: 1000,
    volumeTarget: 10000,
    condition: 'Bounce < 2% AND Spam < 0.05%',
    status: 'completed',
    progress: 100,
    currentMetrics: { bounce: 1.2, spam: 0.03 }
  },
  {
    id: 2,
    name: 'Ramp-Up',
    days: '4-14',
    volumeStart: 10000,
    volumeTarget: 100000,
    condition: 'Bounce < 3% AND Spam < 0.1%',
    status: 'active',
    progress: 65,
    currentMetrics: { bounce: 2.1, spam: 0.08 }
  },
  {
    id: 3,
    name: 'Estabilização',
    days: '15-30',
    volumeStart: 100000,
    volumeTarget: 500000,
    condition: 'Bounce < 4% AND Spam < 0.15%',
    status: 'pending',
    progress: 0,
    currentMetrics: { bounce: 0, spam: 0 }
  },
  {
    id: 4,
    name: 'Cruzeiro',
    days: '30+',
    volumeStart: 500000,
    volumeTarget: 1000000,
    condition: 'Volume máximo sustentável',
    status: 'pending',
    progress: 0,
    currentMetrics: { bounce: 0, spam: 0 }
  }
]

const ipStatus = [
  { ip: '192.168.1.100', phase: 'Ramp-Up', volume: 85000, bounce: 2.1, spam: 0.08, status: 'healthy' },
  { ip: '192.168.1.101', phase: 'Ramp-Up', volume: 78000, bounce: 2.8, spam: 0.12, status: 'warning' },
  { ip: '192.168.1.102', phase: 'Estabilização', volume: 145000, bounce: 1.9, spam: 0.06, status: 'healthy' },
]

export default function WarmUp() {
  const [fallbackEnabled, setFallbackEnabled] = useState(true)
  const [realTimeData, setRealTimeData] = useState(warmupPhases)
  const [realTimeIPs, setRealTimeIPs] = useState(ipStatus)
  const { toast } = useToast()

  // Simulate real-time progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prevPhases => 
        prevPhases.map(phase => {
          if (phase.status === 'active') {
            const newProgress = Math.min(100, phase.progress + Math.random() * 2)
            const newBounce = Math.max(0.5, Math.min(4, phase.currentMetrics.bounce + (Math.random() - 0.5) * 0.3))
            const newSpam = Math.max(0.01, Math.min(0.2, phase.currentMetrics.spam + (Math.random() - 0.5) * 0.02))
            
            return {
              ...phase,
              progress: newProgress,
              currentMetrics: {
                bounce: newBounce,
                spam: newSpam
              }
            }
          }
          return phase
        })
      )

      setRealTimeIPs(prevIPs =>
        prevIPs.map(ip => ({
          ...ip,
          volume: Math.max(50000, Math.min(200000, ip.volume + (Math.random() - 0.5) * 5000)),
          bounce: Math.max(0.5, Math.min(5, ip.bounce + (Math.random() - 0.5) * 0.2)),
          spam: Math.max(0.01, Math.min(0.3, ip.spam + (Math.random() - 0.5) * 0.02)),
          status: ip.bounce > 3.5 ? 'warning' : 'healthy'
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Auto-alerts for high bounce rates
  useEffect(() => {
    realTimeIPs.forEach(ip => {
      if (ip.bounce > 3.5 && ip.status === 'warning') {
        toast({
          title: "⚠️ Bounce Rate Alto",
          description: `IP ${ip.ip}: ${ip.bounce.toFixed(1)}% bounce rate`,
          variant: "destructive",
        })
      }
      if (ip.spam > 0.15) {
        toast({
          title: "🚨 Spam Rate Crítico",
          description: `IP ${ip.ip}: ${(ip.spam * 100).toFixed(2)}% spam rate`,
          variant: "destructive",
        })
      }
    })
  }, [realTimeIPs, toast])

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-success" />
      case 'active': return <Zap className="h-5 w-5 text-warning" />
      case 'pending': return <Clock className="h-5 w-5 text-muted-foreground" />
      default: return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="success-badge">Concluída</Badge>
      case 'active': return <Badge className="warning-badge">Ativa</Badge>
      case 'pending': return <Badge variant="outline">Pendente</Badge>
      default: return <Badge variant="outline">-</Badge>
    }
  }

  const getIPStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success'
      case 'warning': return 'warning'
      case 'danger': return 'destructive'
      default: return 'muted'
    }
  }

  const handleFallbackToggle = (enabled: boolean) => {
    setFallbackEnabled(enabled)
    toast({
      title: enabled ? "Fallback Ativado" : "Fallback Desativado",
      description: enabled 
        ? "Rota compartilhada será usada se spam > 0.15%" 
        : "Warm-up continuará mesmo com spam alto",
      variant: enabled ? "default" : "destructive"
    })
  }

  const handlePauseWarmup = () => {
    toast({
      title: "🛑 Warm-up Pausado",
      description: "Todos os IPs foram pausados temporariamente",
      variant: "destructive",
    })
  }

  const handleForcedFallback = () => {
    toast({
      title: "🚨 Fallback Forçado",
      description: "Migração para rota compartilhada iniciada",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warm-up Wizard</h1>
          <p className="text-muted-foreground">Acompanhe o progresso do warm-up dos seus IPs</p>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="fallback-mode" className="text-sm font-medium">
            Fallback automático (spam {'>'}  0.15%)
          </label>
          <Switch
            id="fallback-mode"
            checked={fallbackEnabled}
            onCheckedChange={handleFallbackToggle}
          />
        </div>
      </div>

      {/* Timeline das Fases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Timeline de Warm-up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {realTimeData.map((phase, index) => (
              <div key={phase.id} className="relative">
                {/* Linha conectora */}
                {index < realTimeData.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
                )}
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getPhaseIcon(phase.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{phase.name}</h3>
                        {getStatusBadge(phase.status)}
                        <span className="text-sm text-muted-foreground">Dias {phase.days}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {phase.volumeStart.toLocaleString()} → {phase.volumeTarget.toLocaleString()} emails/dia
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={phase.progress} className="h-2" />
                        </div>
                        <span className="text-sm font-medium">{phase.progress}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Condição: {phase.condition}</span>
                        {phase.status === 'active' && (
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-1 ${
                              phase.currentMetrics.bounce > 3 ? 'text-warning' : 'text-success'
                            }`}>
                              OR: {phase.currentMetrics.bounce}%
                            </div>
                            <div className={`flex items-center gap-1 ${
                              phase.currentMetrics.spam > 0.1 ? 'text-warning' : 'text-success'
                            }`}>
                              Spam: {phase.currentMetrics.spam}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status dos IPs */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos IPs em Warm-up</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {realTimeIPs.map((ip) => (
              <Card key={ip.ip} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold font-mono text-sm">{ip.ip}</h4>
                    <Badge className={`${getIPStatusColor(ip.status) === 'success' ? 'success-badge' : 
                      getIPStatusColor(ip.status) === 'warning' ? 'warning-badge' : 'info-badge'}`}>
                      {ip.status === 'healthy' ? 'Saudável' : 'Atenção'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fase:</span>
                      <span className="font-medium">{ip.phase}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Volume/dia:</span>
                      <span className="font-medium">{Math.round(ip.volume).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bounce Rate:</span>
                      <span className={`font-medium ${ip.bounce > 3 ? 'text-warning' : 'text-success'}`}>
                        {ip.bounce.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spam Rate:</span>
                      <span className={`font-medium ${ip.spam > 0.1 ? 'text-warning' : 'text-success'}`}>
                        {(ip.spam * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  {ip.bounce > 3 && (
                    <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded text-xs text-warning">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Bounce rate alto - monitorar
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controles de Emergência */}
      <Card>
        <CardHeader>
          <CardTitle className="text-warning">Controles de Emergência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start border-warning hover:bg-warning/10"
              onClick={handlePauseWarmup}
            >
              <div>
                <div className="font-semibold text-warning">Pausar Warm-up</div>
                <div className="text-sm text-muted-foreground">Interromper todos os IPs temporariamente</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start border-destructive hover:bg-destructive/10"
              onClick={handleForcedFallback}
            >
              <div>
                <div className="font-semibold text-destructive">Fallback Forçado</div>
                <div className="text-sm text-muted-foreground">Migrar para rota compartilhada imediatamente</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}