import React, { useState } from 'react';
import { Copy, ArrowRight, Save, Send, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TacticalGrid } from '@/components/tactical/TacticalGrid';
import { TacticalSidebar } from '@/components/tactical/TacticalSidebar';
import { TacticalMetricsSummary } from '@/components/tactical/TacticalMetricsSummary';
import { PoolSelector } from '@/components/tactical/PoolSelector';
import { 
  TacticalPlan, 
  TacticalSlot, 
  TacticalPlannerState, 
  PoolType 
} from '@/types/scheduler';
import { tacticalPlannerMockData } from '@/mocks/tacticalPlannerData';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function SmartPlannerPage() {
  // Estado do Plano Tático
  const [state, setState] = useState<TacticalPlannerState>({
    selectedDate: new Date().toISOString().split('T')[0],
    currentPlan: tacticalPlannerMockData.plan,
    pools: tacticalPlannerMockData.pools,
    segments: tacticalPlannerMockData.segments,
    templates: tacticalPlannerMockData.templates,
    weeklyCoverage: tacticalPlannerMockData.weeklyCoverage,
    selectedSlot: undefined,
    sidebarTab: 'audiences',
    draggedItem: undefined
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const { toast } = useToast();

  // Manipuladores de eventos
  const handlePoolChange = (pool: PoolType) => {
    setState(prev => ({
      ...prev,
      currentPlan: {
        ...prev.currentPlan,
        defaultPool: pool
      }
    }));
    
    toast({
      title: "Pool padrão alterado",
      description: `Pool padrão do dia alterado para ${pool}`,
    });
  };

  const handleSlotUpdate = (slot: TacticalSlot, data: any) => {
    const { item, type } = data;
    
    setState(prev => {
      const newSlots = { ...prev.currentPlan.slots };
      
      if (type === 'segment') {
        newSlots[slot] = {
          ...newSlots[slot],
          segment: item,
          isActive: true
        };
      } else if (type === 'template') {
        newSlots[slot] = {
          ...newSlots[slot],
          template: item,
          isActive: true
        };
      }
      
      return {
        ...prev,
        currentPlan: {
          ...prev.currentPlan,
          slots: newSlots
        }
      };
    });
    
    toast({
      title: "Slot atualizado",
      description: `${type === 'segment' ? 'Segmento' : 'Template'} adicionado ao slot ${slot}`,
    });
  };

  const handleSlotClick = (slot: TacticalSlot) => {
    setState(prev => ({ ...prev, selectedSlot: slot }));
    setIsSidebarOpen(true);
  };

  const handleGenerateVariation = (slot: TacticalSlot) => {
    toast({
      title: "Gerando variação",
      description: `Criando variação do template para ${slot}...`,
    });
  };

  const handleReuseTemplate = (slot: TacticalSlot) => {
    toast({
      title: "Reutilizando template",
      description: `Preparando template para reutilização em ${slot}...`,
    });
  };

  const handleDuplicateDay = () => {
    toast({
      title: "Duplicando dia",
      description: "Configuração do dia duplicada para o próximo dia útil",
    });
  };

  const handleFillNextDay = () => {
    toast({
      title: "Preenchendo próximo dia",
      description: "Aplicando configurações otimizadas para o próximo dia",
    });
  };

  const handleSaveDraft = () => {
    setState(prev => ({
      ...prev,
      currentPlan: {
        ...prev.currentPlan,
        status: 'draft'
      }
    }));
    
    toast({
      title: "Rascunho salvo",
      description: "Configurações salvas como rascunho",
    });
  };

  const handleLaunchDay = async () => {
    setIsLaunching(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setState(prev => ({
        ...prev,
        currentPlan: {
          ...prev.currentPlan,
          status: 'launched'
        }
      }));
      
      toast({
        title: "Dia lançado!",
        description: "Plano tático executado com sucesso",
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Erro ao lançar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLaunching(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header Tático */}
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-primary" />
                  Plano Tático — {state.currentPlan.dayOfWeek}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {new Date(state.selectedDate).toLocaleDateString('pt-BR', { 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleDuplicateDay}>
                <Copy className="h-4 w-4 mr-2" />
                📑 Duplicar Dia
              </Button>
              
              <Button variant="outline" onClick={handleFillNextDay}>
                <ArrowRight className="h-4 w-4 mr-2" />
                ➡ Preencher Próximo Dia
              </Button>
              
              <PoolSelector
                pools={state.pools}
                selectedPool={state.currentPlan.defaultPool}
                onPoolChange={handlePoolChange}
              />
              
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                💾 Salvar Rascunho
              </Button>
              
              <Button 
                onClick={handleLaunchDay}
                disabled={isLaunching}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLaunching ? 'Lançando...' : '📤 Lançar Dia'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-6">
        {/* Grade Tática */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <TacticalGrid
              plan={state.currentPlan}
              onSlotUpdate={handleSlotUpdate}
              onSlotClick={handleSlotClick}
              onGenerateVariation={handleGenerateVariation}
              onReuseTemplate={handleReuseTemplate}
              draggedItem={state.draggedItem}
            />
          </CardContent>
        </Card>

        {/* Botão para abrir sidebar em mobile */}
        <div className="lg:hidden mb-4">
          <Button 
            variant="outline" 
            onClick={() => setIsSidebarOpen(true)}
            className="w-full"
          >
            Abrir Configurações
          </Button>
        </div>
      </div>

      {/* Sidebar Tático */}
      <TacticalSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        segments={state.segments}
        templates={state.templates}
        weeklyCoverage={state.weeklyCoverage}
        activeTab={state.sidebarTab}
        onTabChange={(tab) => setState(prev => ({ ...prev, sidebarTab: tab }))}
      />

      {/* Botão flutuante para sidebar (desktop) */}
      <div className="hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(true)}
          className="bg-card shadow-lg"
        >
          Configurar
        </Button>
      </div>

      {/* Footer de Métricas */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <TacticalMetricsSummary metrics={state.currentPlan.metrics} />
      </div>

      {/* Espaçador para o footer fixo */}
      <div className="h-24"></div>
    </div>
  );
}