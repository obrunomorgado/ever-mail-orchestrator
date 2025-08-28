import React, { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, Settings, Clock, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TimelineGrid } from '@/components/scheduler/TimelineGrid';
import { QuickConfigSidebar } from '@/components/scheduler/QuickConfigSidebar';
import { ValidationFooter } from '@/components/scheduler/ValidationFooter';
import { ScheduledDispatch, ValidationResult } from '@/types/scheduler';
import { schedulerMockData } from '@/mocks/schedulerData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function SmartPlannerPage() {
  // Estado principal
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dispatches, setDispatches] = useState<ScheduledDispatch[]>(
    schedulerMockData.dispatches
  );
  const [selectedDispatch, setSelectedDispatch] = useState<ScheduledDispatch | undefined>();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const { toast } = useToast();

  // Validação em tempo real
  const validation: ValidationResult = React.useMemo(() => {
    const errors = [];
    const warnings = [];
    
    // Mapear assuntos para detectar duplicatas
    const subjectMap = new Map<string, string[]>();
    
    dispatches.forEach(dispatch => {
      const subject = dispatch.customSubject || dispatch.template?.subject;
      
      // Verificar template
      if (!dispatch.template) {
        errors.push({
          id: `missing-template-${dispatch.id}`,
          type: 'missing_template' as const,
          message: `Disparo às ${dispatch.timeSlot} sem template`,
          dispatchId: dispatch.id
        });
      }
      
      // Verificar segmento
      if (!dispatch.segment) {
        errors.push({
          id: `missing-segment-${dispatch.id}`,
          type: 'missing_segment' as const,
          message: `Disparo às ${dispatch.timeSlot} sem segmento`,
          dispatchId: dispatch.id
        });
      }
      
      // Mapear assuntos
      if (subject) {
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, []);
        }
        subjectMap.get(subject)!.push(dispatch.id);
      }
      
      // Verificar status do segmento
      if (dispatch.segment?.status === 'cooldown') {
        warnings.push({
          id: `cooldown-${dispatch.id}`,
          type: 'cooldown_violation' as const,
          message: `Segmento "${dispatch.segment.name}" em cooldown`,
          dispatchId: dispatch.id
        });
      }
      
      if (dispatch.segment?.status === 'frequency_cap') {
        warnings.push({
          id: `frequency-${dispatch.id}`,
          type: 'cooldown_violation' as const,
          message: `Segmento "${dispatch.segment.name}" com limite de frequência`,
          dispatchId: dispatch.id
        });
      }
    });
    
    // Detectar assuntos duplicados
    let duplicateCount = 0;
    subjectMap.forEach((dispatchIds, subject) => {
      if (dispatchIds.length > 1) {
        duplicateCount += dispatchIds.length;
        warnings.push({
          id: `duplicate-${subject}`,
          type: 'duplicate_subject' as const,
          message: `Assunto "${subject}" usado em ${dispatchIds.length} disparos`,
          dispatchId: dispatchIds[0],
          relatedDispatches: dispatchIds
        });
      }
    });
    
    const templatesValidated = dispatches.filter(d => d.template).length;
    const segmentsAssigned = dispatches.filter(d => d.segment).length;
    const timeSlots = new Set(dispatches.map(d => d.timeSlot)).size;
    
    return {
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
      errors,
      warnings,
      summary: {
        templatesValidated,
        segmentsAssigned,
        duplicateSubjects: duplicateCount,
        distinctTimeSlots: timeSlots,
        totalDispatches: dispatches.length
      }
    };
  }, [dispatches]);

  // Manipuladores de eventos
  const handleCreateDispatch = (timeSlot: string) => {
    const newDispatch: ScheduledDispatch = {
      id: `dispatch-${Date.now()}`,
      date: selectedDate,
      timeSlot,
      status: 'draft',
      position: { row: 0, col: 0 }
    };
    
    setDispatches(prev => [...prev, newDispatch]);
    setSelectedDispatch(newDispatch);
    setIsSidebarVisible(true);
    
    toast({
      title: "Novo disparo criado",
      description: `Disparo criado para ${timeSlot}. Configure o template e segmento.`,
    });
  };

  const handleDispatchSelect = (dispatch: ScheduledDispatch) => {
    setSelectedDispatch(dispatch);
    setIsSidebarVisible(true);
  };

  const handleDispatchUpdate = (updatedDispatch: ScheduledDispatch) => {
    setDispatches(prev => 
      prev.map(d => d.id === updatedDispatch.id ? updatedDispatch : d)
    );
    setSelectedDispatch(updatedDispatch);
  };

  const handleDispatchDelete = (id: string) => {
    setDispatches(prev => prev.filter(d => d.id !== id));
    if (selectedDispatch?.id === id) {
      setSelectedDispatch(undefined);
      setIsSidebarVisible(false);
    }
    
    toast({
      title: "Disparo removido",
      description: "O disparo foi removido da agenda.",
    });
  };

  const handleSaveDispatch = () => {
    if (selectedDispatch) {
      const updatedDispatch = {
        ...selectedDispatch,
        status: 'scheduled' as const
      };
      handleDispatchUpdate(updatedDispatch);
      
      toast({
        title: "Disparo salvo",
        description: "As configurações foram salvas com sucesso.",
      });
    }
  };

  const handleConfirmAll = async () => {
    if (validation.hasErrors) {
      toast({
        title: "Não é possível confirmar",
        description: "Corrija os erros antes de agendar todos os disparos.",
        variant: "destructive"
      });
      return;
    }

    setIsConfirming(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const scheduledDispatches = dispatches.map(d => ({
        ...d,
        status: 'scheduled' as const
      }));
      
      setDispatches(scheduledDispatches);
      
      toast({
        title: "Disparos agendados!",
        description: `${dispatches.length} disparos foram agendados com sucesso.`,
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Erro ao agendar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSelectDispatchFromValidation = (dispatchId: string) => {
    const dispatch = dispatches.find(d => d.id === dispatchId);
    if (dispatch) {
      handleDispatchSelect(dispatch);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                Agenda de Disparos
              </h1>
              <p className="text-muted-foreground mt-1">
                Projeto X • {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button onClick={() => handleCreateDispatch('09:00')}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Disparo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          {/* Stats Cards */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dispatches.length}</p>
                  <p className="text-sm text-muted-foreground">Disparos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dispatches.filter(d => d.status === 'scheduled').length}</p>
                  <p className="text-sm text-muted-foreground">Agendados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-info/10 rounded-lg">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dispatches.reduce((sum, d) => sum + (d.predictedClicks || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Cliques prev.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <span className="text-lg">💰</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    R$ {dispatches.reduce((sum, d) => sum + (d.predictedRevenue || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Receita prev.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Grid */}
        <Card>
          <CardContent className="p-6">
            <TimelineGrid
              date={selectedDate}
              dispatches={dispatches}
              selectedDispatch={selectedDispatch}
              onDispatchSelect={handleDispatchSelect}
              onDispatchUpdate={handleDispatchUpdate}
              onDispatchDelete={handleDispatchDelete}
              onCreateDispatch={handleCreateDispatch}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <QuickConfigSidebar
        dispatch={selectedDispatch}
        isVisible={isSidebarVisible}
        onClose={() => {
          setIsSidebarVisible(false);
          setSelectedDispatch(undefined);
        }}
        onUpdate={handleDispatchUpdate}
        onSave={handleSaveDispatch}
        templates={schedulerMockData.templates}
        segments={schedulerMockData.segments}
      />

      {/* Footer de Validação */}
      <ValidationFooter
        validation={validation}
        dispatches={dispatches}
        onConfirmAll={handleConfirmAll}
        onSelectDispatch={handleSelectDispatchFromValidation}
        isConfirming={isConfirming}
      />

      {/* Overlay quando sidebar está aberto */}
      {isSidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => {
            setIsSidebarVisible(false);
            setSelectedDispatch(undefined);
          }}
        />
      )}
    </div>
  );
}