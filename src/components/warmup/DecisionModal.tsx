import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Pause, AlertTriangle } from "lucide-react";
import { SemaforoBadge } from "./SemaforoBadge";

interface DecisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "avançar" | "manter" | "recuar" | "pausar";
  rationale: string;
  newCap: number;
  currentCap: number;
  metrics: {
    spam: number;
    bounce: number;
    hard: number;
    fivexx: number;
    open: number;
  };
  onApply: () => void;
}

export function DecisionModal({
  open,
  onOpenChange,
  action,
  rationale,
  newCap,
  currentCap,
  metrics,
  onApply
}: DecisionModalProps) {
  const actionConfig = {
    avançar: {
      icon: TrendingUp,
      color: "text-success",
      title: "Avançar Warm-up",
      description: "Métricas saudáveis por 2 dias. Subimos +20–25% mantendo foco em T1/T2."
    },
    manter: {
      icon: Pause,
      color: "text-warning",
      title: "Manter Cap Atual", 
      description: "Oscilou. Mantemos o cap e priorizamos T1."
    },
    recuar: {
      icon: TrendingDown,
      color: "text-destructive",
      title: "Recuar Warm-up",
      description: "Limites ultrapassados. Reduzimos -30–50%, voltamos 2 dias na rampa e ficamos em T1."
    },
    pausar: {
      icon: AlertTriangle,
      color: "text-destructive", 
      title: "Pausar Provedor",
      description: "5xx/rejeições elevadas. Pausado 24–48h, retomamos com T1 pequeno."
    }
  };

  const config = actionConfig[action];
  const Icon = config.icon;
  const capChange = ((newCap - currentCap) / currentCap * 100).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo das Métricas */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-3">Métricas Atuais</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between">
                  <span>Spam:</span>
                  <span className={metrics.spam > 0.02 ? "text-destructive" : "text-success"}>
                    {(metrics.spam * 100).toFixed(3)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bounce:</span>
                  <span className={metrics.bounce > 2 ? "text-destructive" : "text-success"}>
                    {metrics.bounce.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hard Bounce:</span>
                  <span className={metrics.hard > 0.3 ? "text-destructive" : "text-success"}>
                    {metrics.hard.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>5xx/Blocks:</span>
                  <span className={metrics.fivexx > 1 ? "text-destructive" : "text-success"}>
                    {metrics.fivexx.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span>Opens Únicos:</span>
                  <span className={metrics.open < 15 ? "text-destructive" : "text-success"}>
                    {metrics.open.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Justificativa */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Justificativa</h4>
              <p className="text-sm text-muted-foreground">{rationale}</p>
            </CardContent>
          </Card>

          {/* Novo Cap */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Ajuste de Cap</h4>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Atual: </span>
                  <span className="font-medium">{currentCap.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Novo: </span>
                  <span className="font-medium">{newCap.toLocaleString()}</span>
                </div>
                <div className={`text-sm font-medium ${
                  parseFloat(capChange) > 0 ? "text-success" : 
                  parseFloat(capChange) < 0 ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {parseFloat(capChange) > 0 ? "+" : ""}{capChange}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Microcopy */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onApply} className={config.color.replace("text-", "bg-")}>
            Aplicar Ajuste
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}