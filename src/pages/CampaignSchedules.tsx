import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Play, Pause, Edit, Trash2, Plus, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

// Mock schedule data
const mockSchedules = [
  {
    id: 'sch-001',
    campaign: 'Black Friday - Cartão Infinite',
    segment: 'VIP Alto Valor',
    totalEmails: 125000,
    sentEmails: 87500,
    timezone: 'America/Sao_Paulo',
    startAt: new Date('2024-01-20T09:00:00'),
    endAt: new Date('2024-01-20T18:00:00'),
    status: 'active',
    priority: 1,
    cadence: '70% hoje, 30% amanhã',
    provider: 'SendGrid',
    estimatedDuration: '8h 30m',
    throughputTarget: 250 // per minute
  },
  {
    id: 'sch-002', 
    campaign: 'Recuperação - Empréstimo Pessoal',
    segment: 'Quase Inativos',
    totalEmails: 95000,
    sentEmails: 0,
    timezone: 'America/Sao_Paulo',
    startAt: new Date('2024-01-21T10:00:00'),
    endAt: new Date('2024-01-21T16:00:00'),
    status: 'scheduled',
    priority: 2,
    cadence: '100% hoje',
    provider: 'SES',
    estimatedDuration: '6h 20m',
    throughputTarget: 180
  },
  {
    id: 'sch-003',
    campaign: 'Newsletter Semanal',
    segment: 'Engajados',
    totalEmails: 450000,
    sentEmails: 450000,
    timezone: 'America/Sao_Paulo',
    startAt: new Date('2024-01-19T08:00:00'),
    endAt: new Date('2024-01-19T14:00:00'),
    status: 'completed',
    priority: 3,
    cadence: '100% hoje',
    provider: 'SendGrid',
    estimatedDuration: '5h 45m',
    throughputTarget: 1300
  },
  {
    id: 'sch-004',
    campaign: 'Oferta Urgente - Investimentos',
    segment: 'Alta Renda',
    totalEmails: 35000,
    sentEmails: 12000,
    timezone: 'America/Sao_Paulo',
    startAt: new Date('2024-01-20T14:00:00'),
    endAt: new Date('2024-01-20T17:00:00'),
    status: 'paused',
    priority: 1,
    cadence: '50% hoje, 50% amanhã',
    provider: 'SMTP',
    estimatedDuration: '2h 15m',
    throughputTarget: 300
  }
];

export default function CampaignSchedules() {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      active: { variant: 'default', text: 'Ativo' },
      scheduled: { variant: 'secondary', text: 'Agendado' },
      paused: { variant: 'outline', text: 'Pausado' },
      completed: { variant: 'outline', text: 'Concluído' },
      failed: { variant: 'destructive', text: 'Falhou' }
    };
    const config = variants[status] || { variant: 'secondary', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getPriorityBadge = (priority: number) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        P{priority}
      </Badge>
    );
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgress = (sent: number, total: number) => {
    return Math.round((sent / total) * 100);
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      schedule.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.segment.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const toggleScheduleStatus = (id: string) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.id === id) {
        const newStatus = schedule.status === 'active' ? 'paused' : 
                         schedule.status === 'paused' ? 'active' : 
                         schedule.status;
        return { ...schedule, status: newStatus };
      }
      return schedule;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agendas de Campanha</h1>
          <p className="text-muted-foreground">Gerencie cronogramas e execução de campanhas</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Agenda
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendas Ativas</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules
                .filter(s => s.startAt.toDateString() === new Date().toDateString())
                .reduce((sum, s) => sum + s.totalEmails, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">emails programados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(schedules.reduce((sum, s) => sum + s.throughputTarget, 0) / schedules.length)}
            </div>
            <p className="text-xs text-muted-foreground">emails/min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((schedules.filter(s => s.status === 'completed').length / schedules.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Buscar campanhas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Execução</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Throughput</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Provedor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="font-medium">{schedule.campaign}</div>
                    <div className="text-sm text-muted-foreground">{schedule.cadence}</div>
                  </TableCell>
                  <TableCell>{schedule.segment}</TableCell>
                  <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={getProgress(schedule.sentEmails, schedule.totalEmails)} 
                        className="w-16"
                      />
                      <span className="text-xs">
                        {schedule.sentEmails.toLocaleString()} / {schedule.totalEmails.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDateTime(schedule.startAt)}</div>
                      <div className="text-muted-foreground">até {formatDateTime(schedule.endAt)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{schedule.throughputTarget}/min</div>
                      <div className="text-muted-foreground">ETA: {schedule.estimatedDuration}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(schedule.priority)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{schedule.provider}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleScheduleStatus(schedule.id)}
                        disabled={schedule.status === 'completed'}
                      >
                        {schedule.status === 'active' ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
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
    </div>
  );
}