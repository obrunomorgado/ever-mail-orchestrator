import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { backfillData } from "@/mocks/demoData";
import { Database, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

export function BackfillPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "failed": return "bg-red-500";
      case "completed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const startBackfill = () => {
    setIsRunning(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Backfill de Dados</h1>
            <p className="text-muted-foreground">
              Preenchimento retroativo de dados históricos
            </p>
          </div>
        </div>
        <Button 
          onClick={startBackfill} 
          disabled={isRunning}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Executando...' : 'Iniciar Backfill'}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso do Backfill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando dados...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Estimativa: {Math.max(0, Math.round((100 - progress) / 10))} minutos restantes
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fontes de Dados</CardTitle>
            <CardDescription>
              Status das conexões com sistemas externos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backfillData.sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(source.status)}
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {source.records.toLocaleString()} registros
                      </div>
                    </div>
                  </div>
                  <Badge variant={source.status === "connected" ? "default" : "secondary"}>
                    {source.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações de Backfill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <select className="w-full p-2 border rounded">
                <option>Últimos 30 dias</option>
                <option>Últimos 90 dias</option>
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Fontes Selecionadas</label>
              <div className="space-y-1">
                {backfillData.sources.map((source) => (
                  <label key={source.id} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      defaultChecked={source.status === "connected"} 
                      disabled={source.status !== "connected"}
                    />
                    <span className="text-sm">{source.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridade</label>
              <select className="w-full p-2 border rounded">
                <option>Normal</option>
                <option>Alta</option>
                <option>Baixa</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Execuções</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backfillData.history.map((execution, index) => (
                <TableRow key={index}>
                  <TableCell>{execution.date}</TableCell>
                  <TableCell className="capitalize">{execution.source}</TableCell>
                  <TableCell>{execution.records.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(execution.status)}
                      <span className="capitalize">{execution.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{execution.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}