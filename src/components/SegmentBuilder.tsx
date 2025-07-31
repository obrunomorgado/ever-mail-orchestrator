import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Target, Users, Filter, Sparkles } from "lucide-react";

interface SegmentCriteria {
  id: string;
  category: string;
  field: string;
  operator: string;
  value: string;
  type: 'include' | 'exclude';
}

const criteriaCategories = [
  {
    name: "Engajamento",
    icon: Target,
    fields: [
      { id: "total_opens", label: "Aberturas totais", operators: ["≥", "≤", "entre", "vazio"] },
      { id: "unique_opens", label: "Aberturas únicas", operators: ["≥", "≤", "entre", "vazio"] },
      { id: "total_clicks", label: "Cliques totais", operators: ["≥", "≤", "entre", "vazio"] },
      { id: "unique_clicks", label: "Cliques únicas", operators: ["≥", "≤", "entre", "vazio"] },
      { id: "last_open_days", label: "Última abertura (dias)", operators: ["≥", "≤", "entre"] },
      { id: "open_rate", label: "Taxa de abertura (%)", operators: ["≥", "≤", "entre"] }
    ]
  },
  {
    name: "Origem & Tecnologia",
    icon: Filter,
    fields: [
      { id: "provider", label: "Provedor", operators: ["é", "não é", "contém"] },
      { id: "domain", label: "Domínio", operators: ["é", "não é", "contém"] },
      { id: "device", label: "Dispositivo", operators: ["é", "não é"] },
      { id: "email_client", label: "Cliente de e-mail", operators: ["é", "não é"] }
    ]
  },
  {
    name: "Atributos & Tags",
    icon: Users,
    fields: [
      { id: "has_tag", label: "Possui Tag", operators: ["sim", "não"] },
      { id: "in_segment", label: "Está em Segmento", operators: ["sim", "não"] },
      { id: "custom_field", label: "Campo customizado", operators: ["contém", "=", "vazio"] }
    ]
  }
];

export function SegmentBuilder() {
  const [criteria, setCriteria] = useState<SegmentCriteria[]>([]);
  const [segmentName, setSegmentName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [criteriaValue, setCriteriaValue] = useState("");

  const addCriteria = (type: 'include' | 'exclude') => {
    if (selectedCategory && selectedField && selectedOperator && criteriaValue) {
      const newCriteria: SegmentCriteria = {
        id: Date.now().toString(),
        category: selectedCategory,
        field: selectedField,
        operator: selectedOperator,
        value: criteriaValue,
        type
      };
      setCriteria([...criteria, newCriteria]);
      // Reset form
      setSelectedField("");
      setSelectedOperator("");
      setCriteriaValue("");
    }
  };

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const includeCriteria = criteria.filter(c => c.type === 'include');
  const excludeCriteria = criteria.filter(c => c.type === 'exclude');
  const estimatedSize = Math.max(1000 - (includeCriteria.length * 200) + (excludeCriteria.length * 100), 50);

  const templates = [
    { name: "VIPs", description: "Alto engajamento últimos 30 dias", criteria: "≥ 10 aberturas, ≥ 5 cliques" },
    { name: "Inativos", description: "Sem engajamento 90+ dias", criteria: "0 aberturas últimos 90 dias" },
    { name: "Recentes", description: "Novos assinantes últimos 7 dias", criteria: "Opt-in últimos 7 dias" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Construtor de Segmentos</h2>
          <p className="text-muted-foreground">Crie segmentos precisos sem complicação</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Users className="w-3 h-3 mr-1" />
            ~{estimatedSize.toLocaleString()} contatos
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Templates Rápidos
            </CardTitle>
            <CardDescription>Segmentos predefinidos para começar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => (
              <div key={template.name} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-muted-foreground">{template.description}</div>
                <div className="text-xs text-primary mt-1">{template.criteria}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Criteria Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Critério</CardTitle>
            <CardDescription>Defina quem deve entrar ou sair do segmento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {criteriaCategories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div className="space-y-2">
                <Label>Campo</Label>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {criteriaCategories
                      .find(cat => cat.name === selectedCategory)
                      ?.fields.map((field) => (
                        <SelectItem key={field.id} value={field.label}>
                          {field.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedField && (
              <div className="space-y-2">
                <Label>Operador</Label>
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o operador" />
                  </SelectTrigger>
                  <SelectContent>
                    {criteriaCategories
                      .find(cat => cat.name === selectedCategory)
                      ?.fields.find(field => field.label === selectedField)
                      ?.operators.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedOperator && (
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  value={criteriaValue}
                  onChange={(e) => setCriteriaValue(e.target.value)}
                  placeholder="Digite o valor"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={() => addCriteria('include')} 
                className="flex-1"
                disabled={!selectedCategory || !selectedField || !selectedOperator || !criteriaValue}
              >
                <Plus className="w-4 h-4 mr-2" />
                Incluir
              </Button>
              <Button 
                onClick={() => addCriteria('exclude')} 
                variant="destructive" 
                className="flex-1"
                disabled={!selectedCategory || !selectedField || !selectedOperator || !criteriaValue}
              >
                <Minus className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview do Segmento</CardTitle>
            <CardDescription>Visualize os critérios aplicados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Segmento</Label>
              <Input
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="Digite o nome do segmento"
              />
            </div>

            {includeCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 mb-2">✅ Incluir:</h4>
                <div className="space-y-2">
                  {includeCriteria.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                      <span>{c.field} {c.operator} {c.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(c.id)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {excludeCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">❌ Excluir:</h4>
                <div className="space-y-2">
                  {excludeCriteria.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-red-50 rounded text-sm">
                      <span>{c.field} {c.operator} {c.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(c.id)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {criteria.length > 0 && (
              <Button className="w-full" disabled={!segmentName}>
                Salvar Segmento
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}