import { useState } from "react";
import { Plus, Search, Filter, TrendingUp, Users, Eye, RefreshCw, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { segments, segmentSuggestions } from "@/mocks/segmentsData";
import { SegmentBuilder } from "@/components/segments/SegmentBuilder";
import { SegmentDashboard } from "@/components/segments/SegmentDashboard";
import { SegmentComparison } from "@/components/segments/SegmentComparison";
import { AutoSuggestions } from "@/components/segments/AutoSuggestions";
import type { Segment } from "@/types/segments";

export function Segments() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTab, setSelectedTab] = useState("segments");

  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      processing: "secondary",
      inactive: "outline",
      error: "destructive"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      simple: "bg-blue-100 text-blue-800",
      composite: "bg-purple-100 text-purple-800",
      lookalike: "bg-green-100 text-green-800"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  const handleRecalculate = (segmentId: string) => {
    toast({
      title: "Recalculando segmento",
      description: "O segmento será atualizado em alguns minutos.",
    });
  };

  const handleExport = (segmentId: string) => {
    toast({
      title: "Exportação iniciada",
      description: "O arquivo CSV será enviado por email em breve.",
    });
  };

  const handleDelete = (segmentId: string) => {
    toast({
      title: "Segmento excluído",
      description: "O segmento foi removido com sucesso.",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segmentos</h1>
          <p className="text-muted-foreground">
            Gerencie e analise seus segmentos dinâmicos
          </p>
        </div>
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Segmento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Segmento</DialogTitle>
              <DialogDescription>
                Use o construtor visual para criar segmentos avançados com múltiplas condições
              </DialogDescription>
            </DialogHeader>
            <SegmentBuilder onClose={() => setShowBuilder(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Segmentos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contatos Segmentados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {segments.reduce((acc, seg) => acc + seg.size, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de contatos únicos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Engajamento Média</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% desde a semana passada
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sugestões Pendentes</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segmentSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">
              Oportunidades identificadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="segments">Segmentos</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar segmentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fontes</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSegments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{segment.name}</div>
                          {segment.description && (
                            <div className="text-sm text-muted-foreground">
                              {segment.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(segment.type)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {segment.sources.slice(0, 2).map((source) => (
                            <Badge key={source} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                          {segment.sources.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{segment.sources.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{segment.size.toLocaleString()}</div>
                        {segment.score && (
                          <div className="text-xs text-muted-foreground">
                            Heat: {segment.score.heat}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(segment.status)}</TableCell>
                      <TableCell>
                        {new Date(segment.lastUpdated).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSegment(segment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRecalculate(segment.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExport(segment.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(segment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="dashboard">
          <SegmentDashboard segments={segments} />
        </TabsContent>

        <TabsContent value="comparison">
          <SegmentComparison segments={segments} />
        </TabsContent>

        <TabsContent value="suggestions">
          <AutoSuggestions suggestions={segmentSuggestions} />
        </TabsContent>
      </Tabs>

      {/* Segment Detail Modal */}
      {selectedSegment && (
        <Dialog open={!!selectedSegment} onOpenChange={() => setSelectedSegment(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedSegment.name}</DialogTitle>
              <DialogDescription>{selectedSegment.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Tamanho</div>
                  <div className="text-2xl font-bold">{selectedSegment.size.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Score de Engajamento</div>
                  <div className="text-2xl font-bold">
                    {selectedSegment.score?.engagement || 0}%
                  </div>
                </div>
              </div>
              {selectedSegment.analytics && (
                <div>
                  <div className="text-sm font-medium mb-2">Performance</div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Taxa de Abertura</div>
                      <div className="font-medium">
                        {selectedSegment.analytics.performance.openRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Taxa de Clique</div>
                      <div className="font-medium">
                        {selectedSegment.analytics.performance.clickRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Taxa de Descadastro</div>
                      <div className="font-medium">
                        {selectedSegment.analytics.performance.unsubscribeRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Taxa de Rejeição</div>
                      <div className="font-medium">
                        {selectedSegment.analytics.performance.bounceRate}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}