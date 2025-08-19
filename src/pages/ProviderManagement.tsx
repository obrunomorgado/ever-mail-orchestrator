import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Server, Settings, AlertTriangle, CheckCircle, Plus, Edit } from 'lucide-react';

// Mock provider data
const mockProviders = [
  {
    id: 'sendgrid',
    name: 'SendGrid',
    status: 'active',
    health: 'healthy',
    dailyLimit: 500000,
    dailySent: Math.floor(Math.random() * 300000) + 100000,
    rateLimit: 8000, // per minute
    currentRate: Math.floor(Math.random() * 6000) + 2000,
    fallbackOrder: 1,
    enabled: true,
    circuitBreaker: 'closed',
    lastError: null
  },
  {
    id: 'ses',
    name: 'Amazon SES',
    status: 'fallback',
    health: 'healthy',
    dailyLimit: 200000,
    dailySent: Math.floor(Math.random() * 50000) + 10000,
    rateLimit: 3000,
    currentRate: Math.floor(Math.random() * 2000) + 500,
    fallbackOrder: 2,
    enabled: true,
    circuitBreaker: 'closed',
    lastError: null
  },
  {
    id: 'smtp',
    name: 'SMTP Dedicado',
    status: 'standby',
    health: 'warning',
    dailyLimit: 100000,
    dailySent: Math.floor(Math.random() * 20000) + 5000,
    rateLimit: 1000,
    currentRate: Math.floor(Math.random() * 500) + 100,
    fallbackOrder: 3,
    enabled: false,
    circuitBreaker: 'half-open',
    lastError: 'Connection timeout - 2 min ago'
  }
];

const mockDomainCaps = [
  { domain: 'gmail.com', limit: 3000, current: Math.floor(Math.random() * 2500) + 1000 },
  { domain: 'yahoo.com', limit: 2000, current: Math.floor(Math.random() * 1500) + 500 },
  { domain: 'outlook.com', limit: 2500, current: Math.floor(Math.random() * 2000) + 800 },
  { domain: 'outros', limit: 5000, current: Math.floor(Math.random() * 3000) + 1500 },
];

export default function ProviderManagement() {
  const [providers, setProviders] = useState(mockProviders);
  const [domainCaps, setDomainCaps] = useState(mockDomainCaps);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'fallback': return 'bg-blue-500';
      case 'standby': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy': return <Badge className="bg-green-100 text-green-800">Saudável</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default: return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const toggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Provedores</h1>
          <p className="text-muted-foreground">Configure provedores SMTP e políticas de fallback</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Provedor
        </Button>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList>
          <TabsTrigger value="providers">Provedores</TabsTrigger>
          <TabsTrigger value="domains">Domain Caps</TabsTrigger>
          <TabsTrigger value="fallback">Políticas de Fallback</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(provider.status)}`} />
                      <CardTitle className="flex items-center gap-2">
                        <Server className="w-5 h-5" />
                        {provider.name}
                      </CardTitle>
                      {getHealthBadge(provider.health)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={provider.enabled}
                        onCheckedChange={() => toggleProvider(provider.id)}
                      />
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Limite Diário</Label>
                      <div className="text-lg font-semibold">
                        {provider.dailySent.toLocaleString()} / {provider.dailyLimit.toLocaleString()}
                      </div>
                      <Progress 
                        value={(provider.dailySent / provider.dailyLimit) * 100} 
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Taxa Atual</Label>
                      <div className="text-lg font-semibold">
                        {provider.currentRate.toLocaleString()}/min
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Máx: {provider.rateLimit.toLocaleString()}/min
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Circuit Breaker</Label>
                      <div className="flex items-center gap-2">
                        {provider.circuitBreaker === 'closed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="text-sm capitalize">{provider.circuitBreaker}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Ordem Fallback</Label>
                      <div className="text-lg font-semibold">#{provider.fallbackOrder}</div>
                    </div>
                  </div>
                  {provider.lastError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Último Erro:</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{provider.lastError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle>Limites por Domínio</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure limites específicos para evitar blocks por ISP
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {domainCaps.map((domain, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-medium capitalize">{domain.domain}</div>
                      <Progress 
                        value={(domain.current / domain.limit) * 100} 
                        className="w-32"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {domain.current.toLocaleString()} / {domain.limit.toLocaleString()}/min
                      </div>
                      <Input 
                        type="number" 
                        value={domain.limit}
                        className="w-24"
                        onChange={(e) => {
                          const newLimit = parseInt(e.target.value);
                          setDomainCaps(prev => prev.map((d, i) => 
                            i === index ? { ...d, limit: newLimit } : d
                          ));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fallback">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Fallback</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure quando e como usar provedores alternativos
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Ordem de Fallback</Label>
                  <div className="mt-2 space-y-2">
                    {providers
                      .sort((a, b) => a.fallbackOrder - b.fallbackOrder)
                      .map((provider, index) => (
                      <div key={provider.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="text-lg font-bold text-muted-foreground">
                          {index + 1}
                        </div>
                        <Server className="w-4 h-4" />
                        <span className="font-medium">{provider.name}</span>
                        <Badge variant={provider.enabled ? "default" : "secondary"}>
                          {provider.enabled ? "Ativo" : "Desabilitado"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Timeout para Fallback (segundos)</Label>
                    <Input type="number" defaultValue="30" className="mt-1" />
                  </div>
                  <div>
                    <Label>Max Retries antes do Fallback</Label>
                    <Input type="number" defaultValue="3" className="mt-1" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Auto Fallback</div>
                    <div className="text-sm text-muted-foreground">
                      Ativar fallback automático quando circuit breaker abrir
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Preserve IP Pool</div>
                    <div className="text-sm text-muted-foreground">
                      Tentar manter o mesmo pool de IPs no fallback
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}