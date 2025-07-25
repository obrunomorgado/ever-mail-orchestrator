import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, AlertTriangle, CheckCircle, Play, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dados demo
const currentThresholds = {
  spamRate: 0.15,
  bounceRate: 5.0,
  volumePerHour: 100000,
  frequencyCap: 3,
  cooldownHours: 24
}

const recentBlocks = [
  {
    id: 1,
    date: '2024-01-20 14:30',
    campaign: 'Newsletter Semanal',
    reason: 'Spam rate excedeu 0.15% (atual: 0.18%)',
    status: 'blocked'
  },
  {
    id: 2,
    date: '2024-01-20 09:15',
    campaign: 'Promoção Flash',
    reason: 'Volume/hora excedeu limite (120k > 100k)',
    status: 'blocked'
  },
  {
    id: 3,
    date: '2024-01-19 16:45',
    campaign: 'Cartões VIP',
    reason: 'Frequency cap violado (4 envios em 24h)',
    status: 'blocked'
  },
  {
    id: 4,
    date: '2024-01-19 11:20',
    campaign: 'Welcome Series',
    reason: 'Bounce rate alto (6.2% > 5%)',
    status: 'blocked'
  }
]

export default function Guardrails() {
  const [thresholds, setThresholds] = useState(currentThresholds)
  const [simulationData, setSimulationData] = useState({
    segment: '',
    volume: '',
    result: null as 'pass' | 'fail' | null,
    reason: ''
  })
  const { toast } = useToast()

  const handleThresholdUpdate = () => {
    toast({
      title: "Guardrails Atualizados ✓",
      description: "Novos thresholds salvos e ativados",
    })
  }

  const handleSimulation = () => {
    if (!simulationData.segment || !simulationData.volume) {
      toast({
        title: "Dados incompletos",
        description: "Preencha segmento e volume para simular",
        variant: "destructive"
      })
      return
    }

    // Simulação baseada em regras simples
    const volume = parseInt(simulationData.volume)
    const isVIP = simulationData.segment.toLowerCase().includes('vip')
    const isHot = simulationData.segment.toLowerCase().includes('hot')
    
    let result: 'pass' | 'fail' = 'pass'
    let reason = 'Todos os guardrails atendidos ✓'

    if (volume > thresholds.volumePerHour) {
      result = 'fail'
      reason = `Volume excede limite de ${thresholds.volumePerHour.toLocaleString()}/hora`
    } else if (!isVIP && !isHot && volume > 50000) {
      result = 'fail'
      reason = 'Segmento de baixo engagement + alto volume = risco'
    }

    setSimulationData(prev => ({ ...prev, result, reason }))
    
    toast({
      title: result === 'pass' ? "Simulação: APROVADO ✓" : "Simulação: BLOQUEADO ⚠️",
      description: reason,
      variant: result === 'pass' ? "default" : "destructive"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deliverability Guardrails</h1>
          <p className="text-muted-foreground">Configure thresholds e monitore bloqueios automáticos</p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-success" />
          <span className="text-success font-medium">Tudo certo, chefia!</span>
        </div>
      </div>

      {/* Configuração de Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração de Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spam-threshold">Spam Rate Máximo (%)</Label>
              <Input
                id="spam-threshold"
                type="number"
                step="0.01"
                value={thresholds.spamRate}
                onChange={(e) => setThresholds(prev => ({ ...prev, spamRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bounce-threshold">Bounce Rate Máximo (%)</Label>
              <Input
                id="bounce-threshold"
                type="number"
                step="0.1"
                value={thresholds.bounceRate}
                onChange={(e) => setThresholds(prev => ({ ...prev, bounceRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume-threshold">Volume Máximo/Hora</Label>
              <Input
                id="volume-threshold"
                type="number"
                value={thresholds.volumePerHour}
                onChange={(e) => setThresholds(prev => ({ ...prev, volumePerHour: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency-cap">Frequency Cap (24h)</Label>
              <Input
                id="frequency-cap"
                type="number"
                value={thresholds.frequencyCap}
                onChange={(e) => setThresholds(prev => ({ ...prev, frequencyCap: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cooldown">Cool-down (horas)</Label>
              <Input
                id="cooldown"
                type="number"
                value={thresholds.cooldownHours}
                onChange={(e) => setThresholds(prev => ({ ...prev, cooldownHours: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <Button onClick={handleThresholdUpdate} className="w-full">
            <Shield className="mr-2 h-4 w-4" />
            Atualizar Guardrails
          </Button>
        </CardContent>
      </Card>

      {/* Simulador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Simulador de Guardrails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select 
                value={simulationData.segment} 
                onValueChange={(value) => setSimulationData(prev => ({ ...prev, segment: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cartoes-vip">Cartões VIP</SelectItem>
                  <SelectItem value="hot-erpm">Hot eRPM</SelectItem>
                  <SelectItem value="opened-3">Opened_3</SelectItem>
                  <SelectItem value="clicked-1">Clicked_1</SelectItem>
                  <SelectItem value="newsletter">Newsletter Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Volume</Label>
              <Input
                type="number"
                placeholder="Ex: 80000"
                value={simulationData.volume}
                onChange={(e) => setSimulationData(prev => ({ ...prev, volume: e.target.value }))}
              />
            </div>
          </div>
          
          <Button onClick={handleSimulation} className="w-full" variant="outline">
            <Play className="mr-2 h-4 w-4" />
            Simular Envio
          </Button>

          {simulationData.result && (
            <div className={`p-4 border rounded-lg ${
              simulationData.result === 'pass' 
                ? 'bg-success/10 border-success/20' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {simulationData.result === 'pass' ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <span className={`font-semibold ${
                  simulationData.result === 'pass' ? 'text-success' : 'text-destructive'
                }`}>
                  {simulationData.result === 'pass' ? 'APROVADO' : 'BLOQUEADO'}
                </span>
              </div>
              <p className="text-sm">{simulationData.reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Bloqueios */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos Bloqueios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBlocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell className="font-mono text-sm">
                    {block.date}
                  </TableCell>
                  <TableCell className="font-medium">
                    {block.campaign}
                  </TableCell>
                  <TableCell className="text-sm">
                    {block.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">
                      Bloqueado
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}