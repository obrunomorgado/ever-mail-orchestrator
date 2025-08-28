import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Mail, 
  Calendar,
  TrendingUp,
  Send 
} from 'lucide-react';
import { ValidationResult, ScheduledDispatch } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface ValidationFooterProps {
  validation: ValidationResult;
  dispatches: ScheduledDispatch[];
  onConfirmAll: () => void;
  onSelectDispatch: (dispatchId: string) => void;
  isConfirming?: boolean;
}

export function ValidationFooter({
  validation,
  dispatches,
  onConfirmAll,
  onSelectDispatch,
  isConfirming = false
}: ValidationFooterProps) {
  const scheduledDispatches = dispatches.filter(d => d.status === 'scheduled');
  const totalPredictedRevenue = dispatches.reduce((sum, d) => sum + (d.predictedRevenue || 0), 0);
  const totalPredictedClicks = dispatches.reduce((sum, d) => sum + (d.predictedClicks || 0), 0);

  const getValidationIcon = (hasErrors: boolean, hasWarnings: boolean) => {
    if (hasErrors) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (hasWarnings) return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const getValidationText = () => {
    if (validation.hasErrors) return 'Correções necessárias';
    if (validation.hasWarnings) return 'Pronto com avisos';
    return 'Pronto para agendar';
  };

  const getValidationColor = () => {
    if (validation.hasErrors) return 'destructive';
    if (validation.hasWarnings) return 'warning';
    return 'success';
  };

  const canConfirm = !validation.hasErrors && validation.summary.totalDispatches > 0;

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-40 border-t shadow-lg rounded-none border-x-0 border-b-0">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Status e Métricas */}
          <div className="flex items-center gap-6">
            {/* Status geral */}
            <div className="flex items-center gap-2">
              {getValidationIcon(validation.hasErrors, validation.hasWarnings)}
              <span className={cn(
                "font-medium text-sm",
                validation.hasErrors && "text-destructive",
                validation.hasWarnings && "text-warning",
                !validation.hasErrors && !validation.hasWarnings && "text-success"
              )}>
                {getValidationText()}
              </span>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Checklist resumido */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Templates:</span>
                <Badge variant={validation.summary.templatesValidated === validation.summary.totalDispatches ? 'default' : 'destructive'}>
                  {validation.summary.templatesValidated}/{validation.summary.totalDispatches}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Segmentos:</span>
                <Badge variant={validation.summary.segmentsAssigned === validation.summary.totalDispatches ? 'default' : 'destructive'}>
                  {validation.summary.segmentsAssigned}/{validation.summary.totalDispatches}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Horários:</span>
                <Badge variant={validation.summary.distinctTimeSlots === validation.summary.totalDispatches ? 'default' : 'secondary'}>
                  {validation.summary.distinctTimeSlots} únicos
                </Badge>
              </div>

              {validation.summary.duplicateSubjects > 0 && (
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-warning">Assuntos repetidos:</span>
                  <Badge variant="outline" className="text-warning border-warning">
                    {validation.summary.duplicateSubjects}
                  </Badge>
                </div>
              )}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Previsões */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cliques esperados:</span>
                <Badge variant="outline">{totalPredictedClicks.toLocaleString()}</Badge>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-lg">💰</span>
                <span className="text-muted-foreground">Receita estimada:</span>
                <Badge variant="outline" className="font-medium">
                  R$ {totalPredictedRevenue.toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Botão de Confirmação */}
          <div className="flex items-center gap-3">
            <div className="text-right text-sm text-muted-foreground">
              <p>{validation.summary.totalDispatches} disparos configurados</p>
              <p>{scheduledDispatches.length} já agendados</p>
            </div>
            
            <Button
              size="lg"
              disabled={!canConfirm || isConfirming}
              onClick={onConfirmAll}
              className={cn(
                "min-w-[160px] font-medium",
                canConfirm && "bg-success hover:bg-success/90"
              )}
            >
              {isConfirming ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Confirmar Todos
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Lista de erros e avisos (se houver) */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex gap-4">
              {/* Erros */}
              {validation.errors.length > 0 && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive mb-2">
                    ❌ Erros ({validation.errors.length})
                  </p>
                  <div className="space-y-1">
                    {validation.errors.slice(0, 3).map((error) => (
                      <button
                        key={error.id}
                        className="text-xs text-destructive hover:underline block text-left"
                        onClick={() => onSelectDispatch(error.dispatchId)}
                      >
                        • {error.message}
                      </button>
                    ))}
                    {validation.errors.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{validation.errors.length - 3} outros erros...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Avisos */}
              {validation.warnings.length > 0 && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning mb-2">
                    ⚠️ Avisos ({validation.warnings.length})
                  </p>
                  <div className="space-y-1">
                    {validation.warnings.slice(0, 3).map((warning) => (
                      <button
                        key={warning.id}
                        className="text-xs text-warning hover:underline block text-left"
                        onClick={() => onSelectDispatch(warning.dispatchId)}
                      >
                        • {warning.message}
                      </button>
                    ))}
                    {validation.warnings.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{validation.warnings.length - 3} outros avisos...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}