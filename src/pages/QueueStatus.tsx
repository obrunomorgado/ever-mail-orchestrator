import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Layers, Play, Pause, RotateCcw, Trash2, Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Mock job data
const generateMockJobs = (status: string, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `job-${status}-${i + 1}`,
    campaign: `Campanha ${Math.floor(Math.random() * 100) + 1}`,
    segment: `Segmento VIP ${Math.floor(Math.random() * 10) + 1}`,
    emails: Math.floor(Math.random() * 5000) + 1000,
    provider: ['SendGrid', 'SES', 'SMTP'][Math.floor(Math.random() * 3)],
    priority: Math.floor(Math.random() * 5) + 1,
    attempts: status === 'failed' ? Math.floor(Math.random() * 3) + 1 : 0,
    createdAt: new Date(Date.now() - Math.random() * 3600000),
    processedAt: status === 'completed' ? new Date() : null,
    error: status === 'failed' ? 'Rate limit exceeded' : null,
    progress: status === 'active' ? Math.floor(Math.random() * 80) + 10 : 
              status === 'completed' ? 100 : 0
  }));
};

export default function QueueStatus() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState({
    pending: generateMockJobs('pending', 45),
    active: generateMockJobs('active', 8),
    completed: generateMockJobs('completed', 120),
    failed: generateMockJobs('failed', 12)
  });

  const [queueStats, setQueueStats] = useState({
    throughput: Math.floor(Math.random() * 50) + 20, // jobs/sec
    avgProcessTime: Math.floor(Math.random() * 30) + 10, // seconds
    totalProcessed: Math.floor(Math.random() * 10000) + 5000,
    successRate: Math.floor(Math.random() * 10) + 90 // %
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueStats({
        throughput: Math.floor(Math.random() * 50) + 20,
        avgProcessTime: Math.floor(Math.random() * 30) + 10,
        totalProcessed: Math.floor(Math.random() * 10000) + 5000,
        successRate: Math.floor(Math.random() * 10) + 90
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'active': return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      pending: 'secondary',
      active: 'default',
      completed: 'outline',
      failed: 'destructive'
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterJobs = (jobList: any[]) => {
    if (!searchTerm) return jobList;
    return jobList.filter(job => 
      job.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.segment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.provider.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Status da Fila</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real dos jobs de envio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Pause className="w-4 h-4 mr-2" />
            Pausar Fila
          </Button>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            Retomar
          </Button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats.throughput}/s</div>
            <p className="text-xs text-muted-foreground">Jobs processados por segundo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats.avgProcessTime}s</div>
            <p className="text-xs text-muted-foreground">Por job</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processado</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats.totalProcessed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueStats.successRate}%</div>
            <Progress value={queueStats.successRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por campanha, segmento ou provedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Jobs Tables */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Ativos ({jobs.active.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({jobs.pending.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídos ({jobs.completed.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Falharam ({jobs.failed.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(jobs).map(([status, jobList]) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  Jobs {status.charAt(0).toUpperCase() + status.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campanha</TableHead>
                      <TableHead>Segmento</TableHead>
                      <TableHead>Emails</TableHead>
                      <TableHead>Provedor</TableHead>
                      <TableHead>Prioridade</TableHead>
                      {status === 'active' && <TableHead>Progresso</TableHead>}
                      {status === 'failed' && <TableHead>Tentativas</TableHead>}
                      <TableHead>Criado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterJobs(jobList).slice(0, 10).map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.campaign}</TableCell>
                        <TableCell>{job.segment}</TableCell>
                        <TableCell>{job.emails.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.provider}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={job.priority > 3 ? "default" : "secondary"}>
                            P{job.priority}
                          </Badge>
                        </TableCell>
                        {status === 'active' && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={job.progress} className="w-16" />
                              <span className="text-xs">{job.progress}%</span>
                            </div>
                          </TableCell>
                        )}
                        {status === 'failed' && (
                          <TableCell>
                            <Badge variant="destructive">{job.attempts}/3</Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(job.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {status === 'failed' && (
                              <Button variant="ghost" size="sm">
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}