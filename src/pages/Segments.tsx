import { useState } from "react";
import { Plus, Search, Eye, RefreshCw, Download, Trash2, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SegmentBuilder } from "@/components/segments/SegmentBuilder";
import { SegmentDetail } from "@/components/segments/SegmentDetail";

// Mock data simplificado
const mockSegments = [
  {
    id: "1",
    name: "Usuários VIP • Engajamento Alto",
    sources: ["Campanhas", "Tags"],
    conditions: "Aberturas ≥ 10 últimos 30d + Tag contém VIP",
    contacts: 12384,
    lastUpdate: "2024-01-15T10:30:00Z",
    trend: "up",
    trendPercentage: 5.2
  },
  {
    id: "2", 
    name: "Inativos Gmail",
    sources: ["Listas", "Campanhas"],
    conditions: "Cliques = 0 últimos 60d + Domínio = Gmail",
    contacts: 8742,
    lastUpdate: "2024-01-15T09:15:00Z",
    trend: "down",
    trendPercentage: 2.1
  },
  {
    id: "3",
    name: "Novos Assinantes Mobile",
    sources: ["Formulários", "Integrações"],
    conditions: "Cadastro últimos 7d + Dispositivo = Mobile",
    contacts: 3156,
    lastUpdate: "2024-01-15T08:45:00Z",
    trend: "up",
    trendPercentage: 15.8
  }
];

export function Segments() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const filteredSegments = mockSegments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.conditions.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const handleViewSegment = (segment: any) => {
    setSelectedSegment(segment);
    setShowDetail(true);
  };

  const handleRecalculate = (segmentId: string) => {
    toast({
      title: "🔄 Recalculando Segmento",
      description: "O segmento será atualizado em alguns instantes.",
    });
  };

  const handleExport = (segmentId: string) => {
    toast({
      title: "📤 Exportando Contatos",
      description: "O arquivo CSV será enviado para seu email.",
    });
  };

  const handleDelete = (segmentId: string) => {
    toast({
      title: "🗑 Segmento Excluído",
      description: "O segmento foi removido com sucesso.",
    });
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Segmentos</h1>
          <p className="text-muted-foreground">
            Gerencie e organize seus contatos com segmentação inteligente
          </p>
        </div>
        
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Segmento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Segmento</DialogTitle>
            </DialogHeader>
            <SegmentBuilder onClose={() => setShowBuilder(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar segmentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">{mockSegments.length} Ativos</span>
            </div>
          </Card>
          
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {mockSegments.reduce((sum, s) => sum + s.contacts, 0).toLocaleString()} Contatos
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Segments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Segmentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Fontes</TableHead>
                <TableHead>Condições</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSegments.map((segment) => (
                <TableRow key={segment.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{segment.name}</div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {segment.trend === "up" ? (
                            <ArrowUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={segment.trend === "up" ? "text-green-600" : "text-red-600"}>
                            {segment.trendPercentage}% últimos 7d
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {segment.sources.map((source, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="max-w-xs">
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {segment.conditions}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">
                      {segment.contacts.toLocaleString()}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatLastUpdate(segment.lastUpdate)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSegment(segment)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecalculate(segment.id)}
                        title="Recalcular"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(segment.id)}
                        title="Exportar"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(segment.id)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSegments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhum segmento encontrado." : "Nenhum segmento criado ainda."}
              </p>
              {!searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowBuilder(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Segmento
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Segment Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSegment?.name}</DialogTitle>
          </DialogHeader>
          {selectedSegment && (
            <SegmentDetail 
              segment={selectedSegment} 
              onClose={() => setShowDetail(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}