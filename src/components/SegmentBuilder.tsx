import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Target, Users, Filter, Sparkles, Crown, Clock, TrendingDown, AlertCircle } from "lucide-react";

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
      { id: "opens_30d", label: "Aberturas últimos 30d", operators: ["≥", "≤", "entre", "= 0"] },
      { id: "opens_60d", label: "Aberturas últimos 60d", operators: ["≥", "≤", "entre", "= 0"] },
      { id: "opens_90d", label: "Aberturas últimos 90d", operators: ["≥", "≤", "entre", "= 0"] },
      { id: "opens_180d", label: "Aberturas últimos 180d", operators: ["≥", "≤", "entre", "= 0"] },
      { id: "clicks_30d", label: "Cliques últimos 30d", operators: ["≥", "≤", "entre", "= 0"] },
      { id: "clicks_60d", label: "Cliques últimos 60d", operators: ["≥", "≤", "entre", "= 0"] },
      { id: "clicks_90d", label: "Cliques últimos 90d", operators: ["≥", "≤", "entre", "= 0"] },
      { id: "clicks_180d", label: "Cliques últimos 180d", operators: ["≥", "≤", "entre", "= 0"] },
      { id: "opens_total", label: "Aberturas totais", operators: ["1-4", "5-9", "≥ 10", "= 0"] },
      { id: "clicks_total", label: "Cliques totais", operators: ["= 0", "1-2", "≥ 3"] }
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

// Segment recipes from user specification
const segmentRecipes = {
  vip: [
    { 
      name: "VIP • Engajamento Máximo", 
      abbrev: "VIP", 
      description: "≥ 10 aberturas E ≥ 3 cliques nos últimos 30 d", 
      estimatedSize: 120000,
      timeSlot: "07h",
      color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
      criteria: [
        { field: "Aberturas últimos 30d", operator: "≥", value: "10", type: "include" },
        { field: "Cliques últimos 30d", operator: "≥", value: "3", type: "include" }
      ]
    },
    { 
      name: "VIP 60 d", 
      abbrev: "VIP-60", 
      description: "≥ 10 aberturas E ≥ 3 cliques nos últimos 60 d", 
      estimatedSize: 135000,
      timeSlot: "09h",
      color: "bg-gradient-to-r from-yellow-300 to-yellow-500",
      criteria: [
        { field: "Aberturas últimos 60d", operator: "≥", value: "10", type: "include" },
        { field: "Cliques últimos 60d", operator: "≥", value: "3", type: "include" }
      ]
    },
    { 
      name: "VIP 90 d", 
      abbrev: "VIP-90", 
      description: "≥ 10 aberturas E ≥ 3 cliques nos últimos 90 d", 
      estimatedSize: 142000,
      timeSlot: "09h",
      color: "bg-gradient-to-r from-yellow-300 to-yellow-500",
      criteria: [
        { field: "Aberturas últimos 90d", operator: "≥", value: "10", type: "include" },
        { field: "Cliques últimos 90d", operator: "≥", value: "3", type: "include" }
      ]
    },
    { 
      name: "VIP 180 d", 
      abbrev: "VIP-180", 
      description: "≥ 10 aberturas E ≥ 3 cliques nos últimos 180 d", 
      estimatedSize: 158000,
      timeSlot: "09h",
      color: "bg-gradient-to-r from-yellow-300 to-yellow-500",
      criteria: [
        { field: "Aberturas últimos 180d", operator: "≥", value: "10", type: "include" },
        { field: "Cliques últimos 180d", operator: "≥", value: "3", type: "include" }
      ]
    }
  ],
  engagement: [
    { 
      name: "Muitas Aberturas • Muitos Cliques", 
      abbrev: "MA-3C+", 
      description: "≥ 10 aberturas E ≥ 3 cliques", 
      estimatedSize: 95000,
      timeSlot: "09h",
      color: "bg-gradient-to-r from-green-400 to-green-600",
      criteria: [
        { field: "Aberturas totais", operator: "≥ 10", value: "", type: "include" },
        { field: "Cliques totais", operator: "≥ 3", value: "", type: "include" }
      ]
    },
    { 
      name: "Muitas Aberturas • Poucos Cliques", 
      abbrev: "MA-2C", 
      description: "≥ 10 aberturas E 1-2 cliques", 
      estimatedSize: 78000,
      timeSlot: "12h",
      color: "bg-gradient-to-r from-green-300 to-green-500",
      criteria: [
        { field: "Aberturas totais", operator: "≥ 10", value: "", type: "include" },
        { field: "Cliques totais", operator: "1-2", value: "", type: "include" }
      ]
    },
    { 
      name: "Muitas Aberturas • Sem Cliques", 
      abbrev: "MA-0C", 
      description: "≥ 10 aberturas E 0 cliques", 
      estimatedSize: 62000,
      timeSlot: "15h",
      color: "bg-gradient-to-r from-yellow-300 to-yellow-500",
      criteria: [
        { field: "Aberturas totais", operator: "≥ 10", value: "", type: "include" },
        { field: "Cliques totais", operator: "= 0", value: "", type: "include" }
      ]
    },
    { 
      name: "Aberturas Moderadas • Muitos Cliques", 
      abbrev: "AM-3C+", 
      description: "5-9 aberturas E ≥ 3 cliques", 
      estimatedSize: 45000,
      timeSlot: "12h",
      color: "bg-gradient-to-r from-green-300 to-green-500",
      criteria: [
        { field: "Aberturas totais", operator: "5-9", value: "", type: "include" },
        { field: "Cliques totais", operator: "≥ 3", value: "", type: "include" }
      ]
    },
    { 
      name: "Aberturas Moderadas • Poucos Cliques", 
      abbrev: "AM-2C", 
      description: "5-9 aberturas E 1-2 cliques", 
      estimatedSize: 52000,
      timeSlot: "15h",
      color: "bg-gradient-to-r from-yellow-300 to-yellow-500",
      criteria: [
        { field: "Aberturas totais", operator: "5-9", value: "", type: "include" },
        { field: "Cliques totais", operator: "1-2", value: "", type: "include" }
      ]
    },
    { 
      name: "Aberturas Moderadas • Sem Cliques", 
      abbrev: "AM-0C", 
      description: "5-9 aberturas E 0 cliques", 
      estimatedSize: 38000,
      timeSlot: "18h",
      color: "bg-gradient-to-r from-orange-300 to-orange-500",
      criteria: [
        { field: "Aberturas totais", operator: "5-9", value: "", type: "include" },
        { field: "Cliques totais", operator: "= 0", value: "", type: "include" }
      ]
    },
    { 
      name: "Baixas Aberturas • Muitos Cliques", 
      abbrev: "BA-3C+", 
      description: "1-4 aberturas E ≥ 3 cliques", 
      estimatedSize: 25000,
      timeSlot: "18h",
      color: "bg-gradient-to-r from-orange-300 to-orange-500",
      criteria: [
        { field: "Aberturas totais", operator: "1-4", value: "", type: "include" },
        { field: "Cliques totais", operator: "≥ 3", value: "", type: "include" }
      ]
    },
    { 
      name: "Baixas Aberturas • Poucos Cliques", 
      abbrev: "BA-2C", 
      description: "1-4 aberturas E 1-2 cliques", 
      estimatedSize: 42000,
      timeSlot: "20h",
      color: "bg-gradient-to-r from-orange-400 to-orange-600",
      criteria: [
        { field: "Aberturas totais", operator: "1-4", value: "", type: "include" },
        { field: "Cliques totais", operator: "1-2", value: "", type: "include" }
      ]
    },
    { 
      name: "Baixas Aberturas • Sem Cliques", 
      abbrev: "BA-0C", 
      description: "1-4 aberturas E 0 cliques", 
      estimatedSize: 35000,
      timeSlot: "20h",
      color: "bg-gradient-to-r from-red-300 to-red-500",
      criteria: [
        { field: "Aberturas totais", operator: "1-4", value: "", type: "include" },
        { field: "Cliques totais", operator: "= 0", value: "", type: "include" }
      ]
    }
  ],
  noEngagement: [
    { 
      name: "Sem Engajamento 30 d", 
      abbrev: "SE-30", 
      description: "0 aberturas E 0 cliques nos últimos 30 d", 
      estimatedSize: 88000,
      timeSlot: "20h",
      color: "bg-gradient-to-r from-red-400 to-red-600",
      criteria: [
        { field: "Aberturas últimos 30d", operator: "= 0", value: "", type: "include" },
        { field: "Cliques últimos 30d", operator: "= 0", value: "", type: "include" }
      ]
    },
    { 
      name: "Sem Engajamento 60 d", 
      abbrev: "SE-60", 
      description: "0 aberturas E 0 cliques nos últimos 60 d", 
      estimatedSize: 92000,
      timeSlot: "20h",
      color: "bg-gradient-to-r from-red-400 to-red-600",
      criteria: [
        { field: "Aberturas últimos 60d", operator: "= 0", value: "", type: "include" },
        { field: "Cliques últimos 60d", operator: "= 0", value: "", type: "include" }
      ]
    },
    { 
      name: "Sem Engajamento 90 d", 
      abbrev: "SE-90", 
      description: "0 aberturas E 0 cliques nos últimos 90 d", 
      estimatedSize: 88000,
      timeSlot: "Mensal",
      color: "bg-gradient-to-r from-gray-400 to-gray-600",
      criteria: [
        { field: "Aberturas últimos 90d", operator: "= 0", value: "", type: "include" },
        { field: "Cliques últimos 90d", operator: "= 0", value: "", type: "include" }
      ]
    },
    { 
      name: "Sem Engajamento 180 d", 
      abbrev: "SE-180", 
      description: "0 aberturas E 0 cliques nos últimos 180 d", 
      estimatedSize: 72000,
      timeSlot: "Trimestral",
      color: "bg-gradient-to-r from-gray-500 to-gray-700",
      criteria: [
        { field: "Aberturas últimos 180d", operator: "= 0", value: "", type: "include" },
        { field: "Cliques últimos 180d", operator: "= 0", value: "", type: "include" }
      ]
    }
  ]
};

export function SegmentBuilder() {
  const [criteria, setCriteria] = useState<SegmentCriteria[]>([]);
  const [segmentName, setSegmentName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");
  const [criteriaValue, setCriteriaValue] = useState("");

  const addCriteria = (type: 'include' | 'exclude') => {
    if (selectedCategory && selectedField && selectedOperator) {
      const newCriteria: SegmentCriteria = {
        id: Date.now().toString(),
        category: selectedCategory,
        field: selectedField,
        operator: selectedOperator,
        value: criteriaValue || "",
        type
      };
      setCriteria([...criteria, newCriteria]);
      // Reset form
      setSelectedField("");
      setSelectedOperator("");
      setCriteriaValue("");
    }
  };

  const applyTemplate = (template: any) => {
    const templateCriteria = template.criteria.map((c: any) => ({
      id: Date.now().toString() + Math.random(),
      category: "Engajamento",
      field: c.field,
      operator: c.operator,
      value: c.value,
      type: c.type
    }));
    setCriteria(templateCriteria);
    setSegmentName(template.name);
  };

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const includeCriteria = criteria.filter(c => c.type === 'include');
  const excludeCriteria = criteria.filter(c => c.type === 'exclude');
  
  // Calculate estimated size based on applied template or manual criteria
  const getCurrentTemplate = () => {
    const allRecipes = [...segmentRecipes.vip, ...segmentRecipes.engagement, ...segmentRecipes.noEngagement];
    return allRecipes.find(recipe => recipe.name === segmentName);
  };
  
  const estimatedSize = getCurrentTemplate()?.estimatedSize || 
    Math.max(50000 - (includeCriteria.length * 8000) + (excludeCriteria.length * 3000), 1000);

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
        {/* Segment Recipes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5" />
              Suas Receitas
            </CardTitle>
            <CardDescription>17 segmentos predefinidos prontos para usar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="vip" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vip" className="text-xs">VIP</TabsTrigger>
                <TabsTrigger value="engagement" className="text-xs">Engajamento</TabsTrigger>
                <TabsTrigger value="noEngagement" className="text-xs">Sem Eng.</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vip" className="space-y-2 mt-4">
                {segmentRecipes.vip.map((recipe) => (
                  <div 
                    key={recipe.abbrev} 
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group"
                    onClick={() => applyTemplate(recipe)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <Badge variant="outline" className={`text-white ${recipe.color} border-none text-xs`}>
                          {recipe.abbrev}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.timeSlot}
                      </Badge>
                    </div>
                    <div className="font-medium text-sm">{recipe.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{recipe.description}</div>
                    <div className="text-xs text-primary mt-1">~{recipe.estimatedSize.toLocaleString()} contatos</div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="engagement" className="space-y-2 mt-4">
                {segmentRecipes.engagement.map((recipe) => (
                  <div 
                    key={recipe.abbrev} 
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group"
                    onClick={() => applyTemplate(recipe)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <Badge variant="outline" className={`text-white ${recipe.color} border-none text-xs`}>
                          {recipe.abbrev}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.timeSlot}
                      </Badge>
                    </div>
                    <div className="font-medium text-sm">{recipe.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{recipe.description}</div>
                    <div className="text-xs text-primary mt-1">~{recipe.estimatedSize.toLocaleString()} contatos</div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="noEngagement" className="space-y-2 mt-4">
                {segmentRecipes.noEngagement.map((recipe) => (
                  <div 
                    key={recipe.abbrev} 
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group"
                    onClick={() => applyTemplate(recipe)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        <Badge variant="outline" className={`text-white ${recipe.color} border-none text-xs`}>
                          {recipe.abbrev}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {recipe.timeSlot}
                      </Badge>
                    </div>
                    <div className="font-medium text-sm">{recipe.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{recipe.description}</div>
                    <div className="text-xs text-primary mt-1">~{recipe.estimatedSize.toLocaleString()} contatos</div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
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
                disabled={!selectedCategory || !selectedField || !selectedOperator}
              >
                <Plus className="w-4 h-4 mr-2" />
                Incluir
              </Button>
              <Button 
                onClick={() => addCriteria('exclude')} 
                variant="destructive" 
                className="flex-1"
                disabled={!selectedCategory || !selectedField || !selectedOperator}
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

            {/* Current template info */}
            {getCurrentTemplate() && (
              <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className={`text-white ${getCurrentTemplate()?.color} border-none`}>
                    {getCurrentTemplate()?.abbrev}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {getCurrentTemplate()?.timeSlot}
                  </Badge>
                </div>
                <div className="text-sm font-medium">{getCurrentTemplate()?.description}</div>
              </div>
            )}

            {includeCriteria.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Incluir:
                </h4>
                <div className="space-y-2">
                  {includeCriteria.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm border border-green-200">
                      <span className="font-medium">{c.field} {c.operator} {c.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(c.id)}
                        className="hover:bg-green-100"
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
                <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Excluir:
                </h4>
                <div className="space-y-2">
                  {excludeCriteria.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-red-50 rounded text-sm border border-red-200">
                      <span className="font-medium">{c.field} {c.operator} {c.value}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(c.id)}
                        className="hover:bg-red-100"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated size with enhanced styling */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Tamanho Estimado</div>
                  <div className="text-2xl font-bold text-primary">
                    ~{estimatedSize.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">contatos únicos</div>
                </div>
                <Users className="w-8 h-8 text-primary/60" />
              </div>
            </div>

            {(criteria.length > 0 || segmentName) && (
              <Button className="w-full" disabled={!segmentName || criteria.length === 0}>
                <Target className="w-4 h-4 mr-2" />
                Salvar Segmento
              </Button>
            )}

            {criteria.length === 0 && !segmentName && (
              <div className="text-center p-4 text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecione uma receita ou crie um critério manual</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}