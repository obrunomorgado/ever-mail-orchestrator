import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Plus, Search, HelpCircle, Tag, Database, Eye, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/DataContext"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Audiences() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewAudienceModal, setShowNewAudienceModal] = useState(false)
  const [ruleBuilder, setRuleBuilder] = useState({
    metric: '',
    operator: '',
    value: '',
    window: ''
  })
  const [dryRunResult, setDryRunResult] = useState<number | null>(null)
  const { toast } = useToast()
  const { audiences, createAudience, loading } = useData()
  const isMobile = useIsMobile()

  const filteredAudiences = audiences.filter(audience =>
    audience.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const smartTags = [
    { name: 'Opened_3', rule: 'opened >= 3', window: '7d', size: 45000, status: 'active' },
    { name: 'Clicked_1', rule: 'clicked >= 1', window: '30d', size: 38000, status: 'active' },
    { name: 'VIP_30d', rule: 'purchase_amount > 500', window: '30d', size: 22000, status: 'active' },
    { name: 'Inativo_90d', rule: 'last_open > 90d', window: '90d', size: 156000, status: 'active' },
    { name: 'Hot_eRPM', rule: 'avg_eRPM > 150', window: '7d', size: 27000, status: 'active' },
  ]

  const handleDryRun = () => {
    // Simula um dry run
    const estimatedSize = Math.floor(Math.random() * 100000) + 10000
    setDryRunResult(estimatedSize)
    toast({
      title: "Dry Run Executado",
      description: `Estimativa: ${estimatedSize.toLocaleString('pt-BR')} contatos`,
    })
  }

  const handleSaveAudience = () => {
    const rule = `${ruleBuilder.metric} ${ruleBuilder.operator} ${ruleBuilder.value} ${ruleBuilder.window ? `AND last_${ruleBuilder.window}` : ''}`
    
    createAudience({
      name: `Custom Audience ${Date.now()}`,
      rule,
      type: 'dynamic',
      eRPM: Math.random() * 200 + 50,
      health: 'good'
    })
    
    setShowNewAudienceModal(false)
    setRuleBuilder({ metric: '', operator: '', value: '', window: '' })
    setDryRunResult(null)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audiences</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">Gerencie suas listas e segmentos dinâmicos</p>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    <strong>Listas = gavetas:</strong> Guardam contatos estáticos<br/>
                    <strong>Tags = post-its:</strong> Marcam comportamentos dinâmicos
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Dialog open={showNewAudienceModal} onOpenChange={setShowNewAudienceModal}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Dynamic Audience
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Audience Dinâmica</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="rule-builder">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="rule-builder">Rule Builder</TabsTrigger>
                  <TabsTrigger value="dry-run">Dry Run</TabsTrigger>
                  <TabsTrigger value="save">Save</TabsTrigger>
                </TabsList>
                
                <TabsContent value="rule-builder" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Métrica</label>
                      <Select value={ruleBuilder.metric} onValueChange={(value) => setRuleBuilder(prev => ({ ...prev, metric: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione métrica" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="opened">E-mails Abertos</SelectItem>
                          <SelectItem value="clicked">Cliques</SelectItem>
                          <SelectItem value="purchase_amount">Valor de Compra</SelectItem>
                          <SelectItem value="last_open">Última Abertura</SelectItem>
                          <SelectItem value="avg_eRPM">eRPM Médio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Operador</label>
                      <Select value={ruleBuilder.operator} onValueChange={(value) => setRuleBuilder(prev => ({ ...prev, operator: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Comparador" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">Maior que</SelectItem>
                          <SelectItem value=">=">Maior ou igual</SelectItem>
                          <SelectItem value="<">Menor que</SelectItem>
                          <SelectItem value="<=">Menor ou igual</SelectItem>
                          <SelectItem value="=">Igual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Valor</label>
                      <Input 
                        placeholder="Ex: 3, 500, 150" 
                        value={ruleBuilder.value}
                        onChange={(e) => setRuleBuilder(prev => ({ ...prev, value: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Janela Temporal</label>
                      <Select value={ruleBuilder.window} onValueChange={(value) => setRuleBuilder(prev => ({ ...prev, window: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">7 dias</SelectItem>
                          <SelectItem value="30d">30 dias</SelectItem>
                          <SelectItem value="90d">90 dias</SelectItem>
                          <SelectItem value="1y">1 ano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dry-run" className="space-y-4">
                  <div className="text-center p-8">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Execute um teste para estimar o tamanho da audience
                    </p>
                    <Button onClick={handleDryRun} variant="outline" size="lg">
                      <Eye className="mr-2 h-4 w-4" />
                      Executar Dry Run
                    </Button>
                    {dryRunResult && (
                      <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-success font-semibold">
                          Resultado: {dryRunResult.toLocaleString('pt-BR')} contatos
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="save" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome da Audience</label>
                      <Input placeholder="Ex: VIPs Últimos 30 Dias" />
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Regra Construída:</p>
                      <code className="text-sm font-mono">
                        {ruleBuilder.metric} {ruleBuilder.operator} {ruleBuilder.value} 
                        {ruleBuilder.window && ` AND last_${ruleBuilder.window}`}
                      </code>
                    </div>
                    <Button onClick={handleSaveAudience} className="w-full" size="lg">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Audience
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar audiences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Audiences Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Audiences Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Regra</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Atualizado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudiences.map((audience) => (
                  <TableRow key={audience.id}>
                    <TableCell className="font-medium">{audience.name}</TableCell>
                    <TableCell className="font-mono text-xs max-w-xs truncate">
                      {audience.rule}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {audience.size.toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={audience.type === 'dynamic' ? 'default' : 'secondary'}>
                        {audience.type === 'dynamic' ? 'Dinâmica' : 'Estática'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {audience.updatedAt.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Smart Tags Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Smart Tags Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {smartTags.map((tag) => (
                <Card key={tag.name} className="border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{tag.name}</h4>
                      <Badge className="success-badge">
                        Atualizado há 4 min ✔
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tag.rule} ({tag.window})
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {tag.size.toLocaleString('pt-BR')}
                      </div>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}