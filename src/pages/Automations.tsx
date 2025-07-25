import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Workflow, Play, Pause, GitBranch, Target, StopCircle, Settings, History, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dados demo
const automationNodes = [
  { id: 'start', type: 'Start', x: 100, y: 100, label: 'Entrada' },
  { id: 'email1', type: 'Action', x: 250, y: 100, label: 'Welcome Email', kpis: { OR: 42, CTR: 3.2, eRPM: 89, Spam: 0.04 } },
  { id: 'split1', type: 'Split', x: 400, y: 100, label: 'Abriu?' },
  { id: 'email2', type: 'Action', x: 300, y: 200, label: 'Follow-up', kpis: { OR: 38, CTR: 2.8, eRPM: 76, Spam: 0.06 } },
  { id: 'goal', type: 'Goal', x: 550, y: 150, label: 'Conversão' },
  { id: 'stop', type: 'Stop-Loss', x: 300, y: 300, label: 'Stop Loss' }
]

const automationTemplates = [
  {
    id: 1,
    name: 'Welcome Series',
    description: '5 emails de boas-vindas + segmentação',
    nodes: 8,
    conversionRate: 12.5,
    status: 'active'
  },
  {
    id: 2,
    name: 'Win-back Campaign',
    description: 'Reativação de inativos 90+ dias',
    nodes: 6,
    conversionRate: 8.3,
    status: 'paused'
  },
  {
    id: 3,
    name: 'VIP Nurturing',
    description: 'Sequência para high-value customers',
    nodes: 12,
    conversionRate: 24.7,
    status: 'active'
  }
]

const versionHistory = [
  { version: 'v2.1', date: '2024-01-20', changes: 'Adicionado A/B test no email 2', active: true },
  { version: 'v2.0', date: '2024-01-15', changes: 'Novo branch para mobile users', active: false },
  { version: 'v1.5', date: '2024-01-10', changes: 'Otimizada condição de split', active: false }
]

export default function Automations() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [abTestEnabled, setAbTestEnabled] = useState(false)
  const [abTestConfig, setAbTestConfig] = useState({ variantA: 20, variantB: 40, control: 40 })
  const { toast } = useToast()

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'Start': return <Play className="h-4 w-4" />
      case 'Action': return <Workflow className="h-4 w-4" />
      case 'Split': return <GitBranch className="h-4 w-4" />
      case 'Goal': return <Target className="h-4 w-4" />
      case 'Stop-Loss': return <StopCircle className="h-4 w-4" />
      default: return <Workflow className="h-4 w-4" />
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'Start': return 'bg-success/10 border-success text-success'
      case 'Action': return 'bg-primary/10 border-primary text-primary'
      case 'Split': return 'bg-warning/10 border-warning text-warning'
      case 'Goal': return 'bg-info/10 border-info text-info'
      case 'Stop-Loss': return 'bg-destructive/10 border-destructive text-destructive'
      default: return 'bg-muted/10 border-muted text-muted-foreground'
    }
  }

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId)
    toast({
      title: "Nó Selecionado",
      description: `Editando propriedades do nó: ${automationNodes.find(n => n.id === nodeId)?.label}`,
    })
  }

  const handleAbTestToggle = (enabled: boolean) => {
    setAbTestEnabled(enabled)
    toast({
      title: enabled ? "A/B Test Ativado" : "A/B Test Desativado",
      description: enabled ? "Split configurado: 20-40-40" : "Voltando para fluxo único",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automations</h1>
          <p className="text-muted-foreground">Visual Builder para sequências de email marketing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" />
            Version History
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Ativar Automation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Canvas Principal */}
        <div className="lg:col-span-3">
          <Card className="min-h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Visual Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Canvas Drag-and-Drop Simulation */}
              <div className="relative w-full h-96 bg-muted/20 border-2 border-dashed border-border rounded-lg overflow-hidden">
                {automationNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute w-32 h-20 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedNode === node.id ? 'ring-2 ring-primary' : ''
                    } ${getNodeColor(node.type)}`}
                    style={{ left: node.x, top: node.y }}
                    onClick={() => handleNodeSelect(node.id)}
                  >
                    <div className="p-2 h-full flex flex-col justify-center items-center text-center">
                      {getNodeIcon(node.type)}
                      <span className="text-xs font-medium mt-1">{node.label}</span>
                      {node.type === 'Action' && node.kpis && (
                        <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            OR {node.kpis.OR}%
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            CTR {node.kpis.CTR}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Conectores simulados */}
                <svg className="absolute inset-0 pointer-events-none">
                  <line x1="200" y1="110" x2="250" y2="110" stroke="hsl(var(--border))" strokeWidth="2" />
                  <line x1="350" y1="110" x2="400" y2="110" stroke="hsl(var(--border))" strokeWidth="2" />
                  <line x1="430" y1="130" x2="360" y2="190" stroke="hsl(var(--border))" strokeWidth="2" />
                  <line x1="480" y1="110" x2="550" y2="140" stroke="hsl(var(--border))" strokeWidth="2" />
                </svg>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-2 mt-4 p-2 bg-muted/50 rounded-lg">
                <Button variant="ghost" size="sm">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Workflow className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <GitBranch className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Target className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <StopCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel Direito - Propriedades */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Propriedades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedNode ? (
                <div className="space-y-3">
                  <div>
                    <Label>Tipo do Nó</Label>
                    <p className="text-sm text-muted-foreground">
                      {automationNodes.find(n => n.id === selectedNode)?.type}
                    </p>
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input defaultValue={automationNodes.find(n => n.id === selectedNode)?.label} />
                  </div>
                  <div>
                    <Label>Route</Label>
                    <Select defaultValue="primary">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">IP Principal</SelectItem>
                        <SelectItem value="backup">IP Backup</SelectItem>
                        <SelectItem value="shared">Rota Compartilhada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedNode.includes('email') && (
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="welcome-1">Welcome v1</SelectItem>
                          <SelectItem value="welcome-2">Welcome v2</SelectItem>
                          <SelectItem value="promo">Promoção</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Selecione um nó para editar suas propriedades
                </p>
              )}
            </CardContent>
          </Card>

          {/* A/B Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm">A/B-C Test</span>
                <Switch checked={abTestEnabled} onCheckedChange={handleAbTestToggle} />
              </CardTitle>
            </CardHeader>
            {abTestEnabled && (
              <CardContent className="space-y-3">
                <div>
                  <Label>Variant A (%)</Label>
                  <Input 
                    type="number" 
                    value={abTestConfig.variantA}
                    onChange={(e) => setAbTestConfig(prev => ({ ...prev, variantA: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Variant B (%)</Label>
                  <Input 
                    type="number" 
                    value={abTestConfig.variantB}
                    onChange={(e) => setAbTestConfig(prev => ({ ...prev, variantB: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Control (%)</Label>
                  <Input 
                    type="number" 
                    value={abTestConfig.control}
                    onChange={(e) => setAbTestConfig(prev => ({ ...prev, control: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* KPIs do Nó Selecionado */}
          {selectedNode && automationNodes.find(n => n.id === selectedNode)?.kpis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  KPIs Live
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const kpis = automationNodes.find(n => n.id === selectedNode)?.kpis
                  return kpis ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-success/10 rounded">
                        <div className="text-xs text-muted-foreground">OR</div>
                        <div className="font-bold text-success">{kpis.OR}%</div>
                      </div>
                      <div className="text-center p-2 bg-info/10 rounded">
                        <div className="text-xs text-muted-foreground">CTR</div>
                        <div className="font-bold text-info">{kpis.CTR}%</div>
                      </div>
                      <div className="text-center p-2 bg-warning/10 rounded">
                        <div className="text-xs text-muted-foreground">eRPM</div>
                        <div className="font-bold text-warning">R${kpis.eRPM}</div>
                      </div>
                      <div className="text-center p-2 bg-destructive/10 rounded">
                        <div className="text-xs text-muted-foreground">Spam</div>
                        <div className="font-bold text-destructive">{kpis.Spam}%</div>
                      </div>
                    </div>
                  ) : null
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Templates e Histórico */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="templates">
            <div className="p-6 pb-0">
              <TabsList>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="history">Version History</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="templates" className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {automationTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge className={template.status === 'active' ? 'success-badge' : 'warning-badge'}>
                          {template.status === 'active' ? 'Ativo' : 'Pausado'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>{template.nodes} nós</span>
                        <span className="text-success font-medium">{template.conversionRate}% conv.</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6 pt-4">
              <div className="space-y-3">
                {versionHistory.map((version) => (
                  <div key={version.version} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{version.version}</span>
                        {version.active && <Badge className="success-badge">Ativa</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{version.changes}</p>
                      <p className="text-xs text-muted-foreground">{version.date}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      {version.active ? 'Atual' : 'Restaurar'}
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}