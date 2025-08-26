import { useState, useCallback } from "react"
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Workflow, Play, GitBranch, Target, StopCircle, Settings, BarChart3, Thermometer, History, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TriggerLibrary } from "@/components/automation/TriggerLibrary"
import { ActionLibrary } from "@/components/automation/ActionLibrary"
import { mockAutomationFlows, mockKPIs, mockHeatSegments } from "@/mocks/automationData"
import { useAutomationValidation } from "@/hooks/useAutomationValidation"

// React Flow Node Types
const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: '🎯 Lista "Cartão Black Friday"' },
    style: { background: 'hsl(var(--primary) / 0.1)', border: '2px solid hsl(var(--primary))' }
  },
  {
    id: 'heat-segment',
    type: 'default', 
    position: { x: 350, y: 100 },
    data: { label: '🌡️ Segmentação Heat' },
    style: { background: 'hsl(var(--warning) / 0.1)', border: '2px solid hsl(var(--warning))' }
  },
  {
    id: 'email-active-7d',
    type: 'default',
    position: { x: 550, y: 50 },
    data: { label: '📧 Alta Frequência\nOR: 45.2% | CTR: 8.7%' },
    style: { background: 'hsl(var(--success) / 0.1)', border: '2px solid hsl(var(--success))' }
  },
  {
    id: 'email-active-30d',
    type: 'default',
    position: { x: 550, y: 150 },
    data: { label: '📧 Nutrição\nOR: 38.1% | CTR: 6.4%' },
    style: { background: 'hsl(var(--info) / 0.1)', border: '2px solid hsl(var(--info))' }
  },
  {
    id: 'email-inactive-90d',
    type: 'default',
    position: { x: 550, y: 250 },
    data: { label: '📧 Reengajamento\nOR: 22.3% | CTR: 3.1%' },
    style: { background: 'hsl(var(--muted) / 0.1)', border: '2px solid hsl(var(--muted-foreground))' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'trigger-1', target: 'heat-segment', animated: true },
  { id: 'e2-3', source: 'heat-segment', target: 'email-active-7d', label: 'Ativos 7d' },
  { id: 'e2-4', source: 'heat-segment', target: 'email-active-30d', label: 'Ativos 30d' },
  { id: 'e2-5', source: 'heat-segment', target: 'email-inactive-90d', label: 'Inativos 90d' }
];

export default function Automations() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showTriggerLibrary, setShowTriggerLibrary] = useState(false);
  const [showActionLibrary, setShowActionLibrary] = useState(false);
  const { toast } = useToast();
  const { validateFlow, validationResult } = useAutomationValidation();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleSaveFlow = () => {
    validateFlow(nodes, edges.map(e => ({
      id: e.id,
      sourceId: e.source,
      targetId: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label
    })));
    
    toast({
      title: "🎯 Fluxo Validado",
      description: "Automação salva com sucesso!",
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Automação para Publishers</h1>
            <p className="text-muted-foreground">Drag-and-drop, Heat Segments e ROI tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowTriggerLibrary(true)}>
              <Target className="mr-2 h-4 w-4" />
              Triggers
            </Button>
            <Button variant="outline" onClick={() => setShowActionLibrary(true)}>
              <Workflow className="mr-2 h-4 w-4" />
              Ações
            </Button>
            <Button onClick={handleSaveFlow}>
              <Play className="mr-2 h-4 w-4" />
              Salvar & Ativar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex">
        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            className="bg-background"
          >
            <Controls position="top-left" />
            <MiniMap position="top-right" />
            <Background variant="dots" gap={20} size={1} />
          </ReactFlow>

          {/* Validation Results */}
          {validationResult && !validationResult.isValid && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-semibold text-destructive mb-2">❌ Erros Encontrados</h4>
                <ul className="text-sm space-y-1">
                  {validationResult.errors.slice(0, 3).map((error, i) => (
                    <li key={i} className="text-destructive">• {error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-80 border-l bg-card p-4 space-y-4">
          {selectedNode ? (
            <>
              <div>
                <h3 className="font-semibold mb-2">Propriedades do Nó</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Nome</Label>
                    <Input value={selectedNode.data.label} readOnly />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <p className="text-sm text-muted-foreground">{selectedNode.type}</p>
                  </div>
                </div>
              </div>

              {/* KPIs se for nó de email */}
              {selectedNode.id.includes('email') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      KPIs Live
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-success/10 p-2 rounded text-center">
                        <div className="font-bold text-success">45.2%</div>
                        <div className="text-xs text-muted-foreground">Abertura</div>
                      </div>
                      <div className="bg-info/10 p-2 rounded text-center">
                        <div className="font-bold text-info">8.7%</div>
                        <div className="text-xs text-muted-foreground">Cliques</div>
                      </div>
                      <div className="bg-warning/10 p-2 rounded text-center">
                        <div className="font-bold text-warning">R$ 89</div>
                        <div className="text-xs text-muted-foreground">RPM</div>
                      </div>
                      <div className="bg-destructive/10 p-2 rounded text-center">
                        <div className="font-bold text-destructive">0.04%</div>
                        <div className="text-xs text-muted-foreground">Spam</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Workflow className="h-12 w-12 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Selecione um Nó</h3>
              <p className="text-sm">Clique em um nó para ver suas propriedades e KPIs</p>
            </div>
          )}

          {/* Heat Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Heat Segments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockHeatSegments.map((segment) => (
                <div key={segment.id} className="flex items-center justify-between text-sm">
                  <span>{segment.name}</span>
                  <Badge variant="outline">{segment.estimatedSize.toLocaleString()}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drawers */}
      <Drawer open={showTriggerLibrary} onOpenChange={setShowTriggerLibrary}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Biblioteca de Triggers</DrawerTitle>
          </DrawerHeader>
          <TriggerLibrary 
            onTriggerSelect={(trigger) => {
              console.log('Trigger selecionado:', trigger);
              setShowTriggerLibrary(false);
            }} 
          />
        </DrawerContent>
      </Drawer>

      <Drawer open={showActionLibrary} onOpenChange={setShowActionLibrary}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Biblioteca de Ações</DrawerTitle>
          </DrawerHeader>
          <ActionLibrary 
            onActionSelect={(action) => {
              console.log('Ação selecionada:', action);
              setShowActionLibrary(false);
            }} 
          />
        </DrawerContent>
      </Drawer>
    </div>
  )
}