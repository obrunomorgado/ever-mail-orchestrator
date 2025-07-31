import { useState, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { automationNodes, automationEdges } from "@/mocks/demoData";
import { GitBranch, Play, Pause, Settings } from "lucide-react";

export function AutomationCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(automationNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(automationEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params as any, eds)), [setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const toggleAutomation = () => {
    setIsRunning(!isRunning);
  };

  const nodeColor = (node: Node) => {
    switch (node.data?.type) {
      case 'trigger': return '#10b981';
      case 'email': return '#3b82f6';
      case 'split': return '#f59e0b';
      case 'goal': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6 h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Canvas de Automação</h1>
            <p className="text-muted-foreground">
              Fluxo visual de emails automatizados
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "Ativo" : "Pausado"}
          </Badge>
          <Button 
            onClick={toggleAutomation}
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)] border rounded-lg">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="top-right"
        >
          <MiniMap 
            nodeColor={nodeColor}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Controls />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Node Details Drawer */}
      {selectedNode && (
        <Drawer open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
          <DrawerContent className="max-w-4xl mx-auto">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {String(selectedNode.data.label)}
              </DrawerTitle>
              <DrawerDescription>
                Configurações e dados do nó: {String(selectedNode.data.type)}
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dados Completos do Nó</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(selectedNode, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {selectedNode.data.type === 'trigger' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Estatísticas do Trigger</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Disparos hoje:</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de sucesso:</span>
                          <span className="font-medium text-green-600">98.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Últimos 7 dias:</span>
                          <span className="font-medium">8,945</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.data.type === 'email' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Performance Email</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Emails enviados:</span>
                          <span className="font-medium">845</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de abertura:</span>
                          <span className="font-medium text-blue-600">24.3%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de clique:</span>
                          <span className="font-medium text-green-600">4.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bounce rate:</span>
                          <span className="font-medium text-red-600">1.2%</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.data.type === 'split' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Divisão de Audiência</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Ramo A (Sim):</span>
                          <span className="font-medium">67% (456 contatos)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ramo B (Não):</span>
                          <span className="font-medium">33% (225 contatos)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Critério:</span>
                          <span className="font-medium text-sm">Abriu último email</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedNode.data.type === 'goal' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Progresso da Meta</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Meta:</span>
                          <span className="font-medium">R$ 12.500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Alcançado:</span>
                          <span className="font-medium text-green-600">R$ 8.750</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Progresso:</span>
                          <span className="font-medium">70%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Conversões:</span>
                          <span className="font-medium">35</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}