import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Settings, Users, Calendar, CheckCircle } from "lucide-react";

interface WizardData {
  // Passo 1 - Contexto
  projeto: string;
  ipPool: string;
  dominio: string;
  sender: string;
  vertical: string;
  pais: string;
  metaDiaria: number;
  metaSemanal?: number;
  janelasDisparo: string[];
  
  // Passo 2 - Base & Segmentos
  ressenciaGlobal: number;
  segmentosGerados: boolean;
  
  // Passo 3 - Plano inicial
  planoConfirmado: boolean;
}

interface WizardSetupProps {
  onComplete: (data: WizardData) => void;
}

export function WizardSetup({ onComplete }: WizardSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    projeto: "",
    ipPool: "",
    dominio: "",
    sender: "",
    vertical: "",
    pais: "BR",
    metaDiaria: 5000,
    metaSemanal: undefined,
    janelasDisparo: [],
    ressenciaGlobal: 4,
    segmentosGerados: false,
    planoConfirmado: false
  });

  const steps = [
    { id: 1, title: "Contexto", icon: Settings },
    { id: 2, title: "Base & Segmentos", icon: Users },
    { id: 3, title: "Plano Inicial", icon: Calendar }
  ];

  const verticalOptions = [
    { id: "cartao", label: "Cartão de Crédito", color: "bg-blue-500" },
    { id: "emprestimo", label: "Empréstimo", color: "bg-green-500" },
    { id: "consorcio", label: "Consórcio", color: "bg-purple-500" },
    { id: "outros", label: "Outros", color: "bg-gray-500" }
  ];

  const diasSemana = [
    { id: "seg", label: "Seg" },
    { id: "ter", label: "Ter" },
    { id: "qua", label: "Qua" },
    { id: "qui", label: "Qui" },
    { id: "sex", label: "Sex" },
    { id: "sab", label: "Sáb" },
    { id: "dom", label: "Dom" }
  ];

  const updateData = (field: keyof WizardData, value: any) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleVerticalSelect = (verticalId: string) => {
    updateData("vertical", verticalId);
  };

  const handleJanelaToggle = (dia: string) => {
    const current = wizardData.janelasDisparo;
    const updated = current.includes(dia) 
      ? current.filter(d => d !== dia)
      : [...current, dia];
    updateData("janelasDisparo", updated);
  };

  const gerarSegmentos = () => {
    updateData("segmentosGerados", true);
  };

  const confirmarPlano = () => {
    updateData("planoConfirmado", true);
    onComplete(wizardData);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projeto">Nome do Projeto</Label>
          <Input
            id="projeto"
            value={wizardData.projeto}
            onChange={(e) => updateData("projeto", e.target.value)}
            placeholder="Ex: Campanha Cartão Gold"
          />
        </div>
        <div>
          <Label htmlFor="ipPool">IP Pool</Label>
          <Select value={wizardData.ipPool} onValueChange={(value) => updateData("ipPool", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar IP Pool" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pool-1">Pool Principal (192.168.1.x)</SelectItem>
              <SelectItem value="pool-2">Pool Secundário (192.168.2.x)</SelectItem>
              <SelectItem value="pool-3">Pool Dedicado (192.168.3.x)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dominio">Domínio</Label>
          <Input
            id="dominio"
            value={wizardData.dominio}
            onChange={(e) => updateData("dominio", e.target.value)}
            placeholder="exemplo.com.br"
          />
        </div>
        <div>
          <Label htmlFor="sender">Sender</Label>
          <Input
            id="sender"
            value={wizardData.sender}
            onChange={(e) => updateData("sender", e.target.value)}
            placeholder="noreply@exemplo.com.br"
          />
        </div>
      </div>

      <div>
        <Label>Vertical</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {verticalOptions.map((vertical) => (
            <Card
              key={vertical.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                wizardData.vertical === vertical.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleVerticalSelect(vertical.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-8 h-8 rounded-full ${vertical.color} mx-auto mb-2`} />
                <p className="text-sm font-medium">{vertical.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="pais">País</Label>
          <Select value={wizardData.pais} onValueChange={(value) => updateData("pais", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BR">Brasil</SelectItem>
              <SelectItem value="AR">Argentina</SelectItem>
              <SelectItem value="MX">México</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="metaDiaria">Meta Diária</Label>
          <Input
            id="metaDiaria"
            type="number"
            value={wizardData.metaDiaria}
            onChange={(e) => updateData("metaDiaria", parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="metaSemanal">Meta Semanal (Opcional)</Label>
          <Input
            id="metaSemanal"
            type="number"
            value={wizardData.metaSemanal || ""}
            onChange={(e) => updateData("metaSemanal", parseInt(e.target.value) || undefined)}
            placeholder="Deixe vazio para auto"
          />
        </div>
      </div>

      <div>
        <Label>Janelas de Disparo</Label>
        <div className="grid grid-cols-7 gap-2 mt-2">
          {diasSemana.map((dia) => (
            <div
              key={dia.id}
              className={`p-3 text-center text-sm font-medium rounded border cursor-pointer transition-all ${
                wizardData.janelasDisparo.includes(dia.id)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted hover:bg-muted/80 border-border"
              }`}
              onClick={() => handleJanelaToggle(dia.id)}
            >
              {dia.label}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Clique nos dias da semana para selecionar as janelas de disparo
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Geração de Segmentos de Warmup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!wizardData.segmentosGerados ? (
            <>
              <p className="text-muted-foreground">
                Clique no botão abaixo para gerar automaticamente os segmentos T1, T2 e T3 
                baseados no histórico de engajamento dos seus contatos.
              </p>
              <Button onClick={gerarSegmentos} className="w-full">
                Gerar Segmentos de Warmup
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Segmentos gerados com sucesso!</span>
              </div>
              
              <div className="grid gap-3">
                <div className="p-3 border border-success/20 bg-success/5 rounded">
                  <h4 className="font-medium text-success">T1 - Engajados 7d</h4>
                  <p className="text-sm text-muted-foreground">
                    Contatos que abriram ou clicaram nos últimos 7 dias
                  </p>
                  <p className="text-xs text-success mt-1">~15.2k contatos estimados</p>
                </div>
                
                <div className="p-3 border border-info/20 bg-info/5 rounded">
                  <h4 className="font-medium text-info">T2 - Engajados 30d</h4>
                  <p className="text-sm text-muted-foreground">
                    Contatos que abriram ou clicaram nos últimos 30 dias
                  </p>
                  <p className="text-xs text-info mt-1">~42.7k contatos estimados</p>
                </div>
                
                <div className="p-3 border border-warning/20 bg-warning/5 rounded">
                  <h4 className="font-medium text-warning">T3 - Reativação 60-90d</h4>
                  <p className="text-sm text-muted-foreground">
                    Contatos inativos para reativação em pequenos blocos
                  </p>
                  <p className="text-xs text-warning mt-1">~128.4k contatos estimados</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <Label htmlFor="ressencia">Ressência Global (dias)</Label>
        <Input
          id="ressencia"
          type="number"
          value={wizardData.ressenciaGlobal}
          onChange={(e) => updateData("ressenciaGlobal", parseInt(e.target.value) || 4)}
          min={1}
          max={30}
        />
        <p className="text-xs text-muted-foreground mt-1">
          O mesmo contato só voltará a receber emails após {wizardData.ressenciaGlobal} dias
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rampa de 14 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[200, 250, 320, 400, 520, 680, 850, 1100, 1400, 1800, 2300, 3000, 3900, 5000].map((cap, index) => (
              <div key={index} className="text-center p-2 bg-muted rounded">
                <div className="text-xs text-muted-foreground">D{index + 1}</div>
                <div className="text-sm font-medium">{cap.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Split Sugerido por Provedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span>Gmail</span>
              <span className="font-medium">58%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span>Outlook</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span>Yahoo</span>
              <span className="font-medium">12%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span>Outros</span>
              <span className="font-medium">5%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thresholds Padrão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Spam:</span>
              <span className="text-success">&lt; 0,02%</span>
            </div>
            <div className="flex justify-between">
              <span>Bounce total:</span>
              <span className="text-success">&lt; 2%</span>
            </div>
            <div className="flex justify-between">
              <span>Hard bounce:</span>
              <span className="text-success">&lt; 0,3%</span>
            </div>
            <div className="flex justify-between">
              <span>5xx/blocks:</span>
              <span className="text-success">&lt; 1%</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span>Opens únicos:</span>
              <span className="text-success">≥ 15%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const canProceed = () => {
    if (currentStep === 1) {
      return wizardData.projeto && wizardData.ipPool && wizardData.dominio && 
             wizardData.sender && wizardData.vertical && wizardData.janelasDisparo.length > 0;
    }
    if (currentStep === 2) {
      return wizardData.segmentosGerados;
    }
    return true;
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Setup do Warmup Coach</h1>
        <p className="text-muted-foreground">Configure seu projeto de warm-up em 3 passos simples</p>
        
        <div className="mt-6">
          <Progress value={progress} className="mb-4" />
          <div className="flex items-center justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? "bg-success border-success text-success-foreground"
                      : isActive
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-muted border-border text-muted-foreground"
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        
        {currentStep < 3 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={confirmarPlano}
            disabled={!canProceed()}
          >
            Criar Plano
          </Button>
        )}
      </div>
    </div>
  );
}