import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Settings as SettingsIcon, User, Bell, Shield, Database, Zap, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FrequencyCapControl } from "@/components/FrequencyCapControl"

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    spamAlerts: true,
    volumeAlerts: true,
    deliverabilityReports: true
  })
  
  const [frequencyCap, setFrequencyCap] = useState([3])
  const [apiRateLimit, setApiRateLimit] = useState([1000])
  
  const { toast } = useToast()

  const handleSaveSettings = () => {
    toast({
      title: "Configurações Salvas ✓",
      description: "Todas as alterações foram aplicadas com sucesso",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure sua conta e preferências da plataforma</p>
        </div>
        <Button onClick={handleSaveSettings} size="lg">
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="limits">Limites</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue="João Silva" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue="joao.silva@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" defaultValue="FinTech Brasil LTDA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Select defaultValue="head-revenue">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head-revenue">Head de Receita</SelectItem>
                      <SelectItem value="analyst">Analista de Retenção</SelectItem>
                      <SelectItem value="tech-lead">Tech Lead</SelectItem>
                      <SelectItem value="cmo">CMO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="america-sao-paulo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-sao-paulo">America/São_Paulo (GMT-3)</SelectItem>
                    <SelectItem value="america-new-york">America/New_York (GMT-5)</SelectItem>
                    <SelectItem value="europe-london">Europe/London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Canais de Notificação</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações por email</p>
                    </div>
                    <Switch 
                      checked={notifications.email} 
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Notificações no navegador</p>
                    </div>
                    <Switch 
                      checked={notifications.push} 
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS</Label>
                      <p className="text-sm text-muted-foreground">Apenas para alertas críticos</p>
                    </div>
                    <Switch 
                      checked={notifications.sms} 
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Tipos de Alerta</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas de Spam</Label>
                      <p className="text-sm text-muted-foreground">Quando spam rate {'>'}  0.1%</p>
                    </div>
                    <Switch 
                      checked={notifications.spamAlerts} 
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, spamAlerts: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertas de Volume</Label>
                      <p className="text-sm text-muted-foreground">Limites de envio excedidos</p>
                    </div>
                    <Switch 
                      checked={notifications.volumeAlerts} 
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, volumeAlerts: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Relatórios de Deliverability</Label>
                      <p className="text-sm text-muted-foreground">Relatório semanal</p>
                    </div>
                    <Switch 
                      checked={notifications.deliverabilityReports} 
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, deliverabilityReports: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Alterar Senha</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input type="password" placeholder="Senha atual" />
                    <Input type="password" placeholder="Nova senha" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação em Duas Etapas (2FA)</Label>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Badge className="success-badge">Ativo</Badge>
                </div>
                <Button variant="outline">Configurar 2FA</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Chrome - São Paulo, Brasil</p>
                      <p className="text-sm text-muted-foreground">Atual sessão • IP: 192.168.1.100</p>
                    </div>
                    <Badge className="success-badge">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">Safari - iPhone</p>
                      <p className="text-sm text-muted-foreground">Há 2 horas • IP: 192.168.1.105</p>
                    </div>
                    <Button variant="ghost" size="sm">Encerrar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integrações Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Supabase</h4>
                      <p className="text-sm text-muted-foreground">Database principal</p>
                    </div>
                  </div>
                  <Badge className="success-badge">Conectado</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Zap className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Zapier</h4>
                      <p className="text-sm text-muted-foreground">Automações</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                      <SettingsIcon className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Webhook Endpoints</h4>
                      <p className="text-sm text-muted-foreground">API callbacks</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limites */}
        <TabsContent value="limits">
          <div className="space-y-6">
            <FrequencyCapControl />
            
            <Card>
              <CardHeader>
                <CardTitle>Outras Configurações de Limite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                <div>
                  <Label>API Rate Limit (requests/min)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={apiRateLimit}
                      onValueChange={setApiRateLimit}
                      max={5000}
                      min={100}
                      step={100}
                      className="flex-1"
                    />
                    <Badge variant="outline">{apiRateLimit[0]}/min</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Limite de requisições para APIs externas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Volume Diário Máximo</Label>
                    <Input defaultValue="5,000,000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cool-down Padrão (horas)</Label>
                    <Input defaultValue="24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plano Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Publisher Pro</h3>
                    <p className="text-muted-foreground">120M emails/mês inclusos</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">R$ 2.499</div>
                    <div className="text-sm text-muted-foreground">/mês</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Emails Enviados</span>
                    <span>87.3M / 120M</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '72.8%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Contatos Ativos</span>
                    <span>3.2M / 5M</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">**** **** **** 4532</p>
                    <p className="text-sm text-muted-foreground">Vence em 12/2025</p>
                  </div>
                  <Button variant="outline" size="sm">Alterar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}