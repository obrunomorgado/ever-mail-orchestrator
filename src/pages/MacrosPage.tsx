import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { macros } from "@/mocks/demoData";
import { FileText, Plus, Edit, Copy, TrendingUp } from "lucide-react";

export function MacrosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "onboarding", "ecommerce", "retention", "campaign"];

  const filteredMacros = macros.filter(macro => {
    const matchesSearch = macro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         macro.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || macro.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const MacroCard = ({ macro }: { macro: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{macro.name}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={macro.type === "automation" ? "default" : "secondary"}>
              {macro.type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {macro.category}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm">
          Assunto: {macro.subject}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <div className="font-medium mb-1">Conteúdo:</div>
          <div className="bg-muted p-2 rounded text-xs max-h-20 overflow-hidden">
            {macro.content.substring(0, 150)}...
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Usado {macro.usage}× • {macro.lastModified}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              <Copy className="w-3 h-3" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Editar Macro: {macro.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Nome da macro" defaultValue={macro.name} />
                  <Input placeholder="Assunto" defaultValue={macro.subject} />
                  <Textarea 
                    placeholder="Conteúdo do email" 
                    defaultValue={macro.content}
                    rows={10}
                  />
                  <div className="text-sm text-muted-foreground">
                    <strong>Variáveis disponíveis:</strong> {macro.variables.join(", ")}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancelar</Button>
                    <Button>Salvar Alterações</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Macros de Email</h1>
            <p className="text-muted-foreground">
              Templates e automações para campanhas de email
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Macro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Macro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome da macro" />
              <Input placeholder="Assunto do email" />
              <Textarea placeholder="Conteúdo do email" rows={10} />
              <Input placeholder="Variáveis (separadas por vírgula)" />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Criar Macro</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar macros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">Todas ({macros.length})</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="retention">Retenção</TabsTrigger>
          <TabsTrigger value="campaign">Campanhas</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredMacros.map((macro) => (
              <MacroCard key={macro.id} macro={macro} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Estatísticas de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{macros.length}</div>
              <div className="text-sm text-muted-foreground">Total de Macros</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {macros.reduce((sum, m) => sum + m.usage, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Usos Este Mês</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(macros.reduce((sum, m) => sum + m.usage, 0) / macros.length)}
              </div>
              <div className="text-sm text-muted-foreground">Uso Médio por Macro</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}