import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Thermometer, Server, Calendar, CheckCircle } from "lucide-react";
import { warmupSchedule } from "@/mocks/demoData";

const steps = [
  { id: 1, title: "Configuração de IP", icon: Server },
  { id: 2, title: "Cronograma", icon: Calendar },
  { id: 3, title: "Resumo", icon: CheckCircle }
];

export function WarmupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [ipAddress, setIpAddress] = useState("192.168.1.100");
  const [domainName, setDomainName] = useState("mail.exemplo.com");

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${isActive ? 'bg-primary text-primary-foreground border-primary' : 
                  isCompleted ? 'bg-green-500 text-white border-green-500' : 
                  'bg-background border-muted-foreground'}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 ml-4 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Configuração do IP</CardTitle>
              <CardDescription>
                Configure o endereço IP e domínio para o processo de warm-up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ip">Endereço IP</Label>
                  <Input
                    id="ip"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domínio</Label>
                  <Input
                    id="domain"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="mail.exemplo.com"
                  />
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Status Atual</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reputação:</span>
                    <Badge variant="outline">Novo IP</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume Recomendado:</span>
                    <span>50 emails/dia (início)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo Estimado:</span>
                    <span>30 dias</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Warm-up</CardTitle>
              <CardDescription>
                Plano de 30 dias para construir a reputação do IP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Semana</th>
                      <th className="text-left p-2">Dias</th>
                      <th className="text-left p-2">Volume/Dia</th>
                      <th className="text-left p-2">Meta OR</th>
                      <th className="text-left p-2">Meta CTR</th>
                      <th className="text-left p-2">Reputação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">1</td>
                      <td className="p-2">1-7</td>
                      <td className="p-2">50-200</td>
                      <td className="p-2">≥25%</td>
                      <td className="p-2">≥2%</td>
                      <td className="p-2">
                        <Progress value={20} className="w-16 h-2" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">2</td>
                      <td className="p-2">8-14</td>
                      <td className="p-2">500-1.000</td>
                      <td className="p-2">≥30%</td>
                      <td className="p-2">≥3%</td>
                      <td className="p-2">
                        <Progress value={40} className="w-16 h-2" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">3</td>
                      <td className="p-2">15-21</td>
                      <td className="p-2">2.000-3.500</td>
                      <td className="p-2">≥35%</td>
                      <td className="p-2">≥4%</td>
                      <td className="p-2">
                        <Progress value={60} className="w-16 h-2" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">4</td>
                      <td className="p-2">22-30</td>
                      <td className="p-2">5.000+</td>
                      <td className="p-2">≥40%</td>
                      <td className="p-2">≥5%</td>
                      <td className="p-2">
                        <Progress value={85} className="w-16 h-2" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Observações Importantes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Monitore bounce rate (&lt;3%) e complaint rate (&lt;0.1%)</li>
                  <li>• Pause se métricas estiverem abaixo das metas</li>
                  <li>• Aumente gradualmente conforme reputação melhora</li>
                  <li>• Use listas limpas e segmentadas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Configuração</CardTitle>
              <CardDescription>
                Revise as configurações antes de iniciar o warm-up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Configurações do IP</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP:</span>
                      <span className="font-medium">{ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domínio:</span>
                      <span className="font-medium">{domainName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duração:</span>
                      <span className="font-medium">30 dias</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Cronograma</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume inicial:</span>
                      <span className="font-medium">50 emails/dia</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume final:</span>
                      <span className="font-medium">5.000 emails/dia</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progressão:</span>
                      <span className="font-medium">Gradual automática</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Pronto para iniciar!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  O processo de warm-up será executado automaticamente. 
                  Você receberá relatórios diários sobre o progresso.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Thermometer className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Assistente de Warm-up</h1>
          <p className="text-muted-foreground">
            Configure o aquecimento do seu IP em 3 passos simples
          </p>
        </div>
      </div>

      <StepIndicator />
      
      {renderStepContent()}

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1}
        >
          Anterior
        </Button>
        
        {currentStep < 3 ? (
          <Button onClick={nextStep}>
            Próximo
          </Button>
        ) : (
          <Button className="bg-green-600 hover:bg-green-700">
            Iniciar Warm-up
          </Button>
        )}
      </div>
    </div>
  );
}