import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Save } from "lucide-react";
import { dailyPlan14d, thresholds } from "@/data/warmupData";

export function PlanView() {
  const { toast } = useToast();
  const [planData, setPlanData] = useState(dailyPlan14d);
  const [currentThresholds, setCurrentThresholds] = useState(thresholds);

  const updatePlanData = (dayIndex: number, field: string, value: number) => {
    setPlanData(prev => prev.map((item, index) => 
      index === dayIndex ? { ...item, [field]: value } : item
    ));
  };

  const updateThreshold = (field: keyof typeof thresholds, value: number) => {
    setCurrentThresholds(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyChanges = () => {
    toast({
      title: "Ajustes aplicados!",
      description: "As alterações no plano foram salvas com sucesso."
    });
  };

  const handleResetPlan = () => {
    setPlanData(dailyPlan14d);
    setCurrentThresholds(thresholds);
    toast({
      title: "Plano resetado!",
      description: "O plano foi restaurado para os valores padrão."
    });
  };

  // Calcular splits por provedor baseado no cap total
  const calculateProviderSplit = (totalCap: number) => {
    return {
      Gmail: Math.round(totalCap * 0.58),
      Outlook: Math.round(totalCap * 0.25),
      Yahoo: Math.round(totalCap * 0.12),
      Outros: Math.round(totalCap * 0.05)
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plano de Warmup</h1>
          <p className="text-muted-foreground">Gerencie sua rampa e regras de avanço</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetPlan}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Rampa
          </Button>
          <Button onClick={handleApplyChanges}>
            <Save className="w-4 h-4 mr-2" />
            Aplicar Ajustes
          </Button>
        </div>
      </div>

      {/* Tabela de Rampa Editável */}
      <Card>
        <CardHeader>
          <CardTitle>Rampa de 14-21 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {/* Headers */}
            <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
              <div>Dia</div>
              <div>Cap Total</div>
              <div>Gmail (58%)</div>
              <div>Outlook (25%)</div>
              <div>Yahoo (12%)</div>
              <div>Outros (5%)</div>
            </div>

            {/* Data Rows */}
            {planData.map((day, index) => {
              const splits = calculateProviderSplit(day.cap);
              return (
                <div key={day.day} className="grid grid-cols-6 gap-2 items-center">
                  <div className="text-sm font-medium">
                    Dia {day.day}
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={day.cap}
                      onChange={(e) => updatePlanData(index, 'cap', parseInt(e.target.value) || 0)}
                      className="text-sm"
                    />
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/50 rounded">
                    {splits.Gmail.toLocaleString()}
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/50 rounded">
                    {splits.Outlook.toLocaleString()}
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/50 rounded">
                    {splits.Yahoo.toLocaleString()}
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/50 rounded">
                    {splits.Outros.toLocaleString()}
                  </div>
                </div>
              );
            })}

            {/* Dias extras 15-21 */}
            {[15, 16, 17, 18, 19, 20, 21].map((dayNum) => {
              const baseCap = planData[planData.length - 1].cap;
              const projectedCap = Math.round(baseCap * (1 + (dayNum - 14) * 0.25));
              const splits = calculateProviderSplit(projectedCap);
              
              return (
                <div key={dayNum} className="grid grid-cols-6 gap-2 items-center opacity-60">
                  <div className="text-sm font-medium">
                    Dia {dayNum}
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/30 rounded">
                    {projectedCap.toLocaleString()}
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/30 rounded">
                    {splits.Gmail.toLocaleString()}
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/30 rounded">
                    {splits.Outlook.toLocaleString()}
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/30 rounded">
                    {splits.Yahoo.toLocaleString()}
                  </div>
                  <div className="text-sm text-center p-2 bg-muted/30 rounded">
                    {splits.Outros.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            * Dias 15-21 são projeções baseadas no último dia da rampa. Os splits por provedor são calculados automaticamente.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regras de Avanço */}
        <Card>
          <CardHeader>
            <CardTitle>Regras de Avanço (Editáveis)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spam-threshold">Spam máximo (%)</Label>
                <Input
                  id="spam-threshold"
                  type="number"
                  step="0.001"
                  value={currentThresholds.spam_ppm}
                  onChange={(e) => updateThreshold('spam_ppm', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="bounce-threshold">Bounce máximo (%)</Label>
                <Input
                  id="bounce-threshold"
                  type="number"
                  step="0.1"
                  value={currentThresholds.bounce_pct}
                  onChange={(e) => updateThreshold('bounce_pct', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hard-bounce-threshold">Hard Bounce máximo (%)</Label>
                <Input
                  id="hard-bounce-threshold"
                  type="number"
                  step="0.01"
                  value={currentThresholds.hard_bounce_pct}
                  onChange={(e) => updateThreshold('hard_bounce_pct', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="fivexx-threshold">5xx/Blocks máximo (%)</Label>
                <Input
                  id="fivexx-threshold"
                  type="number"
                  step="0.1"
                  value={currentThresholds.fivexx_pct}
                  onChange={(e) => updateThreshold('fivexx_pct', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="open-threshold">Opens únicos mínimo (%)</Label>
              <Input
                id="open-threshold"
                type="number"
                step="0.1"
                value={currentThresholds.open_unique_pct}
                onChange={(e) => updateThreshold('open_unique_pct', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <strong>Como funciona:</strong> Se qualquer métrica ultrapassar estes limites, 
              o sistema recomendará recuar ou manter o cap atual. Métricas dentro dos limites 
              permitem avanço gradual.
            </div>
          </CardContent>
        </Card>

        {/* Lógica do Cap Sugerido */}
        <Card>
          <CardHeader>
            <CardTitle>Lógica do Cap Sugerido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border border-success/20 bg-success/5 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-success">Estado Verde</span>
                  <span className="text-sm text-success">+25%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Todas as métricas estão saudáveis
                </p>
              </div>

              <div className="p-3 border border-warning/20 bg-warning/5 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-warning">Estado Amarelo</span>
                  <span className="text-sm text-warning">+10%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Algumas métricas próximas aos limites
                </p>
              </div>

              <div className="p-3 border border-destructive/20 bg-destructive/5 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-destructive">Estado Vermelho</span>
                  <span className="text-sm text-destructive">-30%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Uma ou mais métricas ultrapassaram os limites
                </p>
              </div>
            </div>

            <div className="p-4 bg-card border border-border rounded-lg">
              <h4 className="font-medium text-sm mb-2">Guard-Rails</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Aumento máximo por dia:</span>
                  <span className="text-foreground">+30%</span>
                </div>
                <div className="flex justify-between">
                  <span>Redução mínima em recuo:</span>
                  <span className="text-foreground">-50%</span>
                </div>
                <div className="flex justify-between">
                  <span>Ajuste de provedor vermelho:</span>
                  <span className="text-foreground">-20-30%</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <strong>Redistribuição automática:</strong> Quando Gmail ou Outlook ficam 
              amarelos/vermelhos, o sistema reduz o share deles em 20-30% e redistribui 
              proporcionalmente para os provedores saudáveis.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}