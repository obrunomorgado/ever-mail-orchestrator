import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { lists } from "@/mocks/demoData";
import { useToast } from "@/hooks/use-toast";

interface CleaningCandidate {
  id: string;
  email: string;
  reason: string;
  lastActivity: string;
  risk: 'low' | 'medium' | 'high';
}

const cleaningCandidates: CleaningCandidate[] = [
  { id: '1', email: 'user1@email.com', reason: 'Inativo 180+ dias', lastActivity: '2023-07-15', risk: 'high' },
  { id: '2', email: 'user2@email.com', reason: 'Bounce contínuo', lastActivity: '2023-12-01', risk: 'high' },
  { id: '3', email: 'user3@email.com', reason: 'Nunca abriu', lastActivity: 'Nunca', risk: 'medium' },
  { id: '4', email: 'user4@email.com', reason: 'Inativo 90+ dias', lastActivity: '2023-10-20', risk: 'medium' },
  { id: '5', email: 'user5@email.com', reason: 'Baixo engajamento', lastActivity: '2024-01-10', risk: 'low' },
];

export function ListCleaningPage() {
  const { toast } = useToast();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const toggleCandidate = (id: string) => {
    setSelectedCandidates(prev => 
      prev.includes(id) 
        ? prev.filter(candidateId => candidateId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCandidates(cleaningCandidates.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedCandidates([]);
  };

  const sendLastChanceEmail = () => {
    toast({
      title: "Campanha de última chance enviada",
      description: `Email enviado para ${selectedCandidates.length} contatos selecionados.`,
    });
    console.log('Enviando campanha última chance para:', selectedCandidates);
  };

  const removeContacts = () => {
    toast({
      title: "Contatos removidos",
      description: `${selectedCandidates.length} contatos foram removidos das listas.`,
    });
    console.log('Removendo contatos:', selectedCandidates);
    setSelectedCandidates([]);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trash2 className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Limpeza de Listas</h1>
          <p className="text-muted-foreground">
            Identifique e remova contatos inativos para melhorar a deliverability
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Listas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lists.length}</div>
            <p className="text-xs text-muted-foreground">
              {lists.reduce((sum, list) => sum + list.size, 0).toLocaleString()} contatos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Candidatos à Limpeza</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {cleaningCandidates.length}
            </div>
            <p className="text-xs text-muted-foreground">Contatos com problemas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alto Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {cleaningCandidates.filter(c => c.risk === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Remoção recomendada</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Selecionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {selectedCandidates.length}
            </div>
            <p className="text-xs text-muted-foreground">Para processamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Limpeza</CardTitle>
          <CardDescription>
            Selecione contatos para enviar uma campanha de última chance ou removê-los
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={selectAll}
              disabled={selectedCandidates.length === cleaningCandidates.length}
            >
              Selecionar Todos
            </Button>
            <Button 
              variant="outline" 
              onClick={clearSelection}
              disabled={selectedCandidates.length === 0}
            >
              Limpar Seleção
            </Button>
            <Button 
              onClick={sendLastChanceEmail}
              disabled={selectedCandidates.length === 0}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Enviar Última Chance
            </Button>
            <Button 
              variant="destructive"
              onClick={removeContacts}
              disabled={selectedCandidates.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Remover Contatos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos à Limpeza</CardTitle>
          <CardDescription>
            Lista de contatos identificados para possível remoção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Sel.</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Risco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cleaningCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={() => toggleCandidate(candidate.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {candidate.email}
                  </TableCell>
                  <TableCell>{candidate.reason}</TableCell>
                  <TableCell>{candidate.lastActivity}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getRiskColor(candidate.risk) as any}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getRiskIcon(candidate.risk)}
                      {candidate.risk}
                    </Badge>
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