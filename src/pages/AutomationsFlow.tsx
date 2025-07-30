import React, { useCallback, useState, useEffect } from 'react'
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeTypes,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Workflow, Play, GitBranch, Target, StopCircle, Settings, History, BarChart3, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define types
interface KPIs {
  OR: number
  CTR: number
  eRPM: number
  Spam: number
}

interface NodeData {
  label: string
  kpis?: KPIs
}

// Custom node components
const StartNode = ({ data, selected }: { data: NodeData, selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-success/10 border-2 border-success ${selected ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-center gap-2">
      <Play className="h-4 w-4 text-success" />
      <div className="text-sm font-medium text-success">{data.label}</div>
    </div>
  </div>
)

const ActionNode = ({ data, selected }: { data: NodeData, selected: boolean }) => (
  <div className={`px-4 py-3 shadow-md rounded-md bg-primary/10 border-2 border-primary ${selected ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-center gap-2 mb-2">
      <Workflow className="h-4 w-4 text-primary" />
      <div className="text-sm font-medium text-primary">{data.label}</div>
    </div>
    {data.kpis && (
      <div className="grid grid-cols-2 gap-1">
        <Badge variant="outline" className="text-xs px-1 py-0">OR {data.kpis.OR}%</Badge>
        <Badge variant="outline" className="text-xs px-1 py-0">CTR {data.kpis.CTR}%</Badge>
        <Badge variant="outline" className="text-xs px-1 py-0">R${data.kpis.eRPM}</Badge>
        <Badge variant="outline" className="text-xs px-1 py-0">{data.kpis.Spam}%</Badge>
      </div>
    )}
  </div>
)

const SplitNode = ({ data, selected }: { data: NodeData, selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-warning/10 border-2 border-warning ${selected ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-center gap-2">
      <GitBranch className="h-4 w-4 text-warning" />
      <div className="text-sm font-medium text-warning">{data.label}</div>
    </div>
  </div>
)

const GoalNode = ({ data, selected }: { data: NodeData, selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-info/10 border-2 border-info ${selected ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-center gap-2">
      <Target className="h-4 w-4 text-info" />
      <div className="text-sm font-medium text-info">{data.label}</div>
    </div>
  </div>
)

const StopNode = ({ data, selected }: { data: NodeData, selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-destructive/10 border-2 border-destructive ${selected ? 'ring-2 ring-primary' : ''}`}>
    <div className="flex items-center gap-2">
      <StopCircle className="h-4 w-4 text-destructive" />
      <div className="text-sm font-medium text-destructive">{data.label}</div>
    </div>
  </div>
)

const nodeTypes: NodeTypes = {
  start: StartNode,
  action: ActionNode,
  split: SplitNode,
  goal: GoalNode,
  stop: StopNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 100, y: 100 },
    data: { label: 'Entrada' },
    sourcePosition: Position.Right,
  },
  {
    id: '2',
    type: 'action',
    position: { x: 300, y: 100 },
    data: { 
      label: 'Welcome Email',
      kpis: { OR: 42, CTR: 3.2, eRPM: 89, Spam: 0.04 }
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '3',
    type: 'split',
    position: { x: 500, y: 100 },
    data: { label: 'Abriu?' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '4',
    type: 'action',
    position: { x: 400, y: 200 },
    data: { 
      label: 'Follow-up',
      kpis: { OR: 38, CTR: 2.8, eRPM: 76, Spam: 0.06 }
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '5',
    type: 'goal',
    position: { x: 700, y: 150 },
    data: { label: 'Conversão' },
    targetPosition: Position.Left,
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4', label: 'Não abriu' },
  { id: 'e3-5', source: '3', target: '5', label: 'Abriu' },
  { id: 'e4-5', source: '4', target: '5' },
]

export default function AutomationsFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [abTestEnabled, setAbTestEnabled] = useState(false)
  const [isModified, setIsModified] = useState(false)
  const { toast } = useToast()

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge(params, eds))
      setIsModified(true)
      toast({
        title: "Conexão Criada",
        description: "Nova conexão adicionada ao fluxo",
      })
    },
    [setEdges, toast]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id)
  }, [])

  const handleSaveFlow = () => {
    // Simulate saving
    setIsModified(false)
    toast({
      title: "Fluxo Salvo ✓",
      description: "Automation salva com sucesso",
    })
  }

  const handleActivateFlow = () => {
    toast({
      title: "Automation Ativada",
      description: "Fluxo está agora ativo e processando emails",
    })
  }

  // Simulate real-time KPI updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'action') {
            const nodeData = node.data as unknown as NodeData
            if (nodeData.kpis) {
              return {
                ...node,
                data: {
                  ...nodeData,
                  kpis: {
                    OR: Math.max(30, Math.min(50, nodeData.kpis.OR + (Math.random() - 0.5) * 2)),
                    CTR: Math.max(1, Math.min(5, nodeData.kpis.CTR + (Math.random() - 0.5) * 0.2)),
                    eRPM: Math.max(50, Math.min(120, nodeData.kpis.eRPM + (Math.random() - 0.5) * 5)),
                    Spam: Math.max(0, Math.min(0.2, nodeData.kpis.Spam + (Math.random() - 0.5) * 0.01)),
                  }
                }
              }
            }
          }
          return node
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [setNodes])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automations Flow</h1>
          <p className="text-muted-foreground">Construa sequências com drag & drop real</p>
        </div>
        <div className="flex items-center gap-2">
          {isModified && (
            <Badge variant="outline" className="text-warning">
              Não salvo
            </Badge>
          )}
          <Button variant="outline" onClick={handleSaveFlow} disabled={!isModified}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
          <Button onClick={handleActivateFlow}>
            <Play className="mr-2 h-4 w-4" />
            Ativar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Flow Canvas */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Canvas de Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[400px] md:h-[520px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                className="bg-muted/20"
                panOnDrag
                panOnScroll
                zoomOnScroll
                zoomOnPinch
                deleteKeyCode={null}
              >
                <Controls className="hidden md:flex" />
                <MiniMap nodeColor="#94a3b8" nodeStrokeColor="#475569" className="hidden md:block" />
                <Background />
              </ReactFlow>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
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
                    <Label>Nó Selecionado</Label>
                    <p className="text-sm text-muted-foreground">
                      {(nodes.find(n => n.id === selectedNode)?.data as unknown as NodeData)?.label}
                    </p>
                  </div>
                  <div>
                    <Label>Label</Label>
                    <Input 
                      defaultValue={(nodes.find(n => n.id === selectedNode)?.data as unknown as NodeData)?.label}
                      onChange={() => setIsModified(true)}
                    />
                  </div>
                  <div>
                    <Label>Template</Label>
                    <Select onValueChange={() => setIsModified(true)}>
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
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Clique em um nó para editar suas propriedades
                </p>
              )}
            </CardContent>
          </Card>

          {/* A/B Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm">A/B Test</span>
                <Switch checked={abTestEnabled} onCheckedChange={setAbTestEnabled} />
              </CardTitle>
            </CardHeader>
            {abTestEnabled && (
              <CardContent className="space-y-3">
                <div>
                  <Label>Split (%)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Variant A" onChange={() => setIsModified(true)} />
                    <Input placeholder="Variant B" onChange={() => setIsModified(true)} />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Live KPIs */}
          {selectedNode && (nodes.find(n => n.id === selectedNode)?.data as unknown as NodeData)?.kpis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" />
                  KPIs em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const kpis = (nodes.find(n => n.id === selectedNode)?.data as unknown as NodeData)?.kpis
                  return kpis ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-success/10 rounded">
                        <div className="text-xs text-muted-foreground">OR</div>
                        <div className="font-bold text-success">{kpis.OR.toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-2 bg-info/10 rounded">
                        <div className="text-xs text-muted-foreground">CTR</div>
                        <div className="font-bold text-info">{kpis.CTR.toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-2 bg-warning/10 rounded">
                        <div className="text-xs text-muted-foreground">eRPM</div>
                        <div className="font-bold text-warning">R${kpis.eRPM.toFixed(0)}</div>
                      </div>
                      <div className="text-center p-2 bg-destructive/10 rounded">
                        <div className="text-xs text-muted-foreground">Spam</div>
                        <div className="font-bold text-destructive">{(kpis.Spam * 100).toFixed(2)}%</div>
                      </div>
                    </div>
                  ) : null
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}