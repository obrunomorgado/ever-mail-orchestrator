import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Mail, CheckCircle, AlertTriangle, Clock, Zap, Server, TrendingUp } from 'lucide-react';

// Mock data with random numbers
const generateRandomData = () => ({
  throughput: {
    current: Math.floor(Math.random() * 5000) + 1000, // 1k-6k emails/min
    target: 8000,
    efficiency: Math.floor(Math.random() * 30) + 70, // 70-100%
  },
  campaigns: {
    active: Math.floor(Math.random() * 8) + 2, // 2-10 active
    queued: Math.floor(Math.random() * 15) + 5, // 5-20 queued
    completed: Math.floor(Math.random() * 50) + 20, // 20-70 completed today
  },
  providers: {
    sendgrid: { status: 'healthy', throughput: Math.floor(Math.random() * 3000) + 2000 },
    ses: { status: 'warning', throughput: Math.floor(Math.random() * 1500) + 500 },
    smtp: { status: 'healthy', throughput: Math.floor(Math.random() * 800) + 200 },
  },
  jobs: {
    pending: Math.floor(Math.random() * 200) + 50,
    active: Math.floor(Math.random() * 50) + 10,
    failed: Math.floor(Math.random() * 20) + 5,
  }
});

const generateChartData = () => {
  const now = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const time = new Date(now.getTime() - (29 - i) * 60000);
    return {
      time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      emails: Math.floor(Math.random() * 3000) + 1000,
      success: Math.floor(Math.random() * 20) + 80,
      bounces: Math.floor(Math.random() * 5) + 1,
    };
  });
};

export default function CampaignMonitor() {
  const [data, setData] = useState(generateRandomData());
  const [chartData, setChartData] = useState(generateChartData());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateRandomData());
      setChartData(generateChartData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitor de Campanhas</h1>
          <p className="text-muted-foreground">Acompanhamento em tempo real do sistema de envio</p>
        </div>
        <Button>
          <Zap className="w-4 h-4 mr-2" />
          Atualizar Agora
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput Atual</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.throughput.current.toLocaleString()}/min</div>
            <Progress value={(data.throughput.current / data.throughput.target) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Meta: {data.throughput.target.toLocaleString()}/min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.campaigns.active}</div>
            <p className="text-xs text-muted-foreground">
              {data.campaigns.queued} na fila • {data.campaigns.completed} concluídas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.throughput.efficiency}%</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 minutos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs na Fila</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.jobs.pending}</div>
            <p className="text-xs text-muted-foreground">
              {data.jobs.active} processando • {data.jobs.failed} falharam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="throughput" className="w-full">
        <TabsList>
          <TabsTrigger value="throughput">Throughput</TabsTrigger>
          <TabsTrigger value="providers">Provedores</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="throughput">
          <Card>
            <CardHeader>
              <CardTitle>Volume de Envio (Últimos 30 min)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="emails" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data.providers).map(([name, provider]) => (
              <Card key={name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(provider.status)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{provider.throughput.toLocaleString()}/min</div>
                  <Badge variant={provider.status === 'healthy' ? 'default' : 'destructive'} className="mt-2">
                    {provider.status === 'healthy' ? 'Saudável' : 'Atenção'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Sucesso vs Bounces</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" fill="hsl(var(--primary))" name="Sucesso %" />
                  <Bar dataKey="bounces" fill="hsl(var(--destructive))" name="Bounces %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}