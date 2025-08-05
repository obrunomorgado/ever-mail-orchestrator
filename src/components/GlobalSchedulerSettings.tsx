import { useState, useCallback } from 'react';
import { Settings, Plus, X, Clock, Calendar, Shield, Timer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePlanner } from '@/contexts/PlannerContext';
import { useToast } from '@/hooks/use-toast';

interface GlobalSchedulerSettingsProps {
  trigger?: React.ReactNode;
}

export function GlobalSchedulerSettings({ trigger }: GlobalSchedulerSettingsProps) {
  const { state, setAnchorTimes, setFrequencyCap, setCoolDown, setMaxPlanningWindow } = usePlanner();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newAnchorTime, setNewAnchorTime] = useState('');
  const [localSettings, setLocalSettings] = useState({
    anchorTimes: state.anchorTimes,
    frequencyCap: state.frequencyCap,
    coolDown: state.coolDown,
    maxPlanningWindow: state.maxPlanningWindow || 30,
  });

  console.log('[Planner] GlobalSchedulerSettings - Current state:', {
    anchorTimes: state.anchorTimes,
    frequencyCap: state.frequencyCap,
    coolDown: state.coolDown,
    maxPlanningWindow: state.maxPlanningWindow,
  });

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleAddAnchorTime = useCallback(() => {
    if (!newAnchorTime) return;
    
    if (!validateTime(newAnchorTime)) {
      toast({
        variant: 'destructive',
        title: 'Horário inválido',
        description: 'Use o formato HH:MM (ex: 09:00)',
      });
      return;
    }

    if (localSettings.anchorTimes.includes(newAnchorTime)) {
      toast({
        variant: 'destructive',
        title: 'Horário duplicado',
        description: 'Este horário já foi adicionado',
      });
      return;
    }

    const updatedTimes = [...localSettings.anchorTimes, newAnchorTime].sort();
    setLocalSettings(prev => ({ ...prev, anchorTimes: updatedTimes }));
    setNewAnchorTime('');
  }, [newAnchorTime, localSettings.anchorTimes, toast]);

  const handleRemoveAnchorTime = useCallback((timeToRemove: string) => {
    if (localSettings.anchorTimes.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'É necessário pelo menos um horário-âncora',
      });
      return;
    }

    setLocalSettings(prev => ({
      ...prev,
      anchorTimes: prev.anchorTimes.filter(time => time !== timeToRemove)
    }));
  }, [localSettings.anchorTimes, toast]);

  const handleSaveSettings = useCallback(() => {
    try {
      setAnchorTimes(localSettings.anchorTimes);
      setFrequencyCap(localSettings.frequencyCap);
      setCoolDown(localSettings.coolDown);
      setMaxPlanningWindow(localSettings.maxPlanningWindow);

      // Persist to localStorage
      localStorage.setItem('planner_prefs', JSON.stringify({
        anchorTimes: localSettings.anchorTimes,
        maxPlanningWindow: localSettings.maxPlanningWindow,
      }));

      localStorage.setItem('deliverability_prefs', JSON.stringify({
        frequencyCap: localSettings.frequencyCap,
        coolDown: localSettings.coolDown,
      }));

      toast({
        title: 'Configurações salvas',
        description: 'As configurações do planejador foram atualizadas',
      });

      setIsOpen(false);
      console.log('[Planner] Settings saved:', localSettings);
    } catch (error) {
      console.error('[Planner] Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao salvar configurações',
      });
    }
  }, [localSettings, setAnchorTimes, setFrequencyCap, setCoolDown, setMaxPlanningWindow, toast]);

  const handleCancel = useCallback(() => {
    setLocalSettings({
      anchorTimes: state.anchorTimes,
      frequencyCap: state.frequencyCap,
      coolDown: state.coolDown,
      maxPlanningWindow: state.maxPlanningWindow || 30,
    });
    setNewAnchorTime('');
    setIsOpen(false);
  }, [state]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Planejador
          </DialogTitle>
          <DialogDescription>
            Configure os horários-âncora, limites e preferências para otimizar seu planejamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Horários-Âncora */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-4 w-4" />
                Horários-Âncora
              </CardTitle>
              <CardDescription>
                Defina os horários preferenciais para envio de campanhas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {localSettings.anchorTimes.map((time) => (
                  <Badge
                    key={time}
                    variant="secondary"
                    className="gap-2 py-2 px-3 text-sm"
                  >
                    <Clock className="h-3 w-3" />
                    {time}
                    <button
                      onClick={() => handleRemoveAnchorTime(time)}
                      className="ml-1 hover:text-destructive transition-colors"
                      disabled={localSettings.anchorTimes.length <= 1}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="09:00"
                  value={newAnchorTime}
                  onChange={(e) => setNewAnchorTime(e.target.value)}
                  className="max-w-20"
                  pattern="[0-2][0-9]:[0-5][0-9]"
                />
                <Button 
                  onClick={handleAddAnchorTime}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formato: HH:MM (ex: 09:00, 14:30)
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* Janela de Planejamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-4 w-4" />
                Janela de Planejamento
              </CardTitle>
              <CardDescription>
                Defina até quantos dias no futuro é possível planejar campanhas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxWindow">
                  Máximo: {localSettings.maxPlanningWindow} dias
                </Label>
                <Slider
                  id="maxWindow"
                  min={7}
                  max={90}
                  step={1}
                  value={[localSettings.maxPlanningWindow]}
                  onValueChange={(value) => setLocalSettings(prev => ({ 
                    ...prev, 
                    maxPlanningWindow: value[0] 
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>7 dias</span>
                  <span>90 dias</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Controles de Deliverability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-4 w-4" />
                Controles de Deliverability
              </CardTitle>
              <CardDescription>
                Configure limites para proteger a reputação de envio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Frequency Cap */}
              <div className="space-y-2">
                <Label htmlFor="frequencyCap">
                  Frequency Cap: {localSettings.frequencyCap} email(s) por destinatário/24h
                </Label>
                <Slider
                  id="frequencyCap"
                  min={1}
                  max={6}
                  step={1}
                  value={[localSettings.frequencyCap]}
                  onValueChange={(value) => setLocalSettings(prev => ({ 
                    ...prev, 
                    frequencyCap: value[0] 
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 email</span>
                  <span>6 emails</span>
                </div>
              </div>

              {/* Cooldown */}
              <div className="space-y-2">
                <Label htmlFor="cooldown">
                  Cooldown Padrão
                </Label>
                <Select
                  value={localSettings.coolDown.toString()}
                  onValueChange={(value) => setLocalSettings(prev => ({ 
                    ...prev, 
                    coolDown: parseInt(value) 
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => i + 1).map((days) => (
                      <SelectItem key={days} value={days.toString()}>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          {days} dia{days > 1 ? 's' : ''}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Tempo mínimo entre campanhas para o mesmo segmento
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSaveSettings}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}