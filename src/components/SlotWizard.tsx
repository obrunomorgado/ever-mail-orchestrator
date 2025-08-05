import React, { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Search, Users, Clock, AlertTriangle, CheckCircle, Copy, CalendarDays } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePlanner, CampaignSegment } from '@/contexts/PlannerContext';
import { TemplatePreview, mockTemplates } from './TemplatePreview';
import { format, addDays, addWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SlotWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  date?: string;
  timeSlot?: string;
  segments: CampaignSegment[];
  editingSlot?: { date: string; timeSlot: string; campaignId: string } | null;
}

interface SlotConfig {
  selectedDates: Date[];
  selectedTime: string;
  quantity: number;
  cooldownOverride?: number;
  audienceType: 'segments' | 'tags' | 'lists';
}

interface AudienceData {
  segments: CampaignSegment[];
  tags: Array<{ id: string; name: string; size: number; }>;
  lists: Array<{ id: string; name: string; size: number; }>;
}

export function SlotWizard({ isOpen, onOpenChange, date, timeSlot, segments, editingSlot }: SlotWizardProps) {
  const { createSlot, duplicateDay, state } = usePlanner();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [selectedAudience, setSelectedAudience] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [config, setConfig] = useState<SlotConfig>({
    selectedDates: date ? [new Date(date)] : [],
    selectedTime: timeSlot || state.anchorTimes[0] || '09:00',
    quantity: 1000,
    audienceType: 'segments',
    cooldownOverride: undefined
  });
  const [templateFilter, setTemplateFilter] = useState('all');

  // Mock audience data
  const audienceData: AudienceData = {
    segments,
    tags: [
      { id: 'tag-1', name: 'VIP Clientes', size: 15000 },
      { id: 'tag-2', name: 'Novos Usuários', size: 25000 },
      { id: 'tag-3', name: 'Inadimplentes', size: 8000 },
      { id: 'tag-4', name: 'Alto Valor', size: 12000 },
    ],
    lists: [
      { id: 'list-1', name: 'Newsletter Principal', size: 45000 },
      { id: 'list-2', name: 'Promoções', size: 32000 },
      { id: 'list-3', name: 'Cartão Premium', size: 18000 },
      { id: 'list-4', name: 'Investimentos', size: 22000 },
    ]
  };

  // Reset wizard when opened/closed
  useEffect(() => {
    if (isOpen) {
      console.log('[SlotWizard] Opening wizard with editing slot:', editingSlot);
      if (editingSlot) {
        // TODO: Load editing data
        setStep(3); // Go to review step for editing
      } else {
        setStep(0);
        setConfig(prev => ({
          ...prev,
          selectedDates: date ? [new Date(date)] : [],
          selectedTime: timeSlot || state.anchorTimes[0] || '09:00'
        }));
      }
    } else {
      // Reset state when closing
      setStep(0);
      setSelectedAudience(null);
      setSelectedTemplate(null);
      setSearchTerm('');
      setTemplateFilter('all');
    }
  }, [isOpen, editingSlot, date, timeSlot, state.anchorTimes]);

  // Filter current audience data based on search and type
  const filteredAudienceData = useCallback(() => {
    const currentData = audienceData[config.audienceType];
    return currentData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [config.audienceType, searchTerm, audienceData]);

  // Filter templates based on category
  const filteredTemplates = useCallback(() => {
    if (templateFilter === 'all') return mockTemplates;
    return mockTemplates.filter(template => 
      template.name.toLowerCase().includes(templateFilter.toLowerCase())
    );
  }, [templateFilter]);

  // Check if audience has cooldown or frequency violations
  const getAudienceStatus = useCallback((audience: any) => {
    // Mock validation logic - in real app this would check actual constraints
    const isInCooldown = Math.random() > 0.8; // 20% chance of cooldown
    const hasFrequencyViolation = Math.random() > 0.9; // 10% chance of frequency violation
    
    if (hasFrequencyViolation) {
      return { status: 'violation', message: 'Limite de frequência excedido' };
    }
    if (isInCooldown) {
      return { status: 'cooldown', message: `Cool-down: ${Math.ceil(Math.random() * 3)} dias restantes` };
    }
    return { status: 'available', message: 'Disponível para agendamento' };
  }, []);

  const handleDateSelect = (dates: Date[]) => {
    setConfig(prev => ({ ...prev, selectedDates: dates }));
  };

  const handleAudienceSelect = (audience: any) => {
    setSelectedAudience(audience);
    setConfig(prev => ({
      ...prev,
      quantity: Math.min(prev.quantity, audience.size)
    }));
    setStep(2);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep(3);
  };

  const handleSave = () => {
    if (!selectedAudience || !selectedTemplate || config.selectedDates.length === 0) return;
    
    console.log('[SlotWizard] Saving slots for dates:', config.selectedDates);
    
    // Check max planning window
    const maxPlanningDays = state.maxPlanningWindow || 30;
    const today = new Date();
    const invalidDates = config.selectedDates.filter(date => {
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > maxPlanningDays;
    });
    
    if (invalidDates.length > 0) {
      const { toast } = require('@/hooks/use-toast');
      toast({
        title: "Data excede limite de planejamento",
        description: `Algumas datas excedem o limite de ${maxPlanningDays} dias`,
        variant: "destructive"
      });
      return;
    }
    
    // Create slots for all selected dates
    config.selectedDates.forEach(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      createSlot(dateString, config.selectedTime, selectedAudience.id, selectedTemplate);
    });
    
    onOpenChange(false);
  };

  const handleDuplicateDay = () => {
    if (!selectedAudience || !selectedTemplate || config.selectedDates.length === 0) return;
    
    const tomorrowDates = config.selectedDates.map(date => addDays(date, 1));
    
    tomorrowDates.forEach(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      createSlot(dateString, config.selectedTime, selectedAudience.id, selectedTemplate);
    });
    
    onOpenChange(false);
  };

  const handleDuplicateWeek = () => {
    if (!selectedAudience || !selectedTemplate || config.selectedDates.length === 0) return;
    
    const nextWeekDates = config.selectedDates.map(date => addWeeks(date, 1));
    
    nextWeekDates.forEach(date => {
      const dateString = format(date, 'yyyy-MM-dd');
      createSlot(dateString, config.selectedTime, selectedAudience.id, selectedTemplate);
    });
    
    onOpenChange(false);
  };

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as 0 | 1 | 2 | 3);
  };

  const handleBack = () => {
    if (step > 0) setStep((step - 1) as 0 | 1 | 2 | 3);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const generateVariation = () => {
    // Mock AI variation generation
    console.log('[SlotWizard] Generating AI variation for template:', selectedTemplate);
    // In real app, this would call an AI service to create template variations
  };

  const getStepTitle = () => {
    switch (step) {
      case 0: return 'Data & Horário';
      case 1: return 'Público';
      case 2: return 'Template';
      case 3: return 'Revisão & Confirmar';
      default: return 'Configuração';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 0: return 'Selecione as datas e horário para a campanha';
      case 1: return 'Escolha o público-alvo (segmentos, tags ou listas)';
      case 2: return `Selecione o template para "${selectedAudience?.name}"`;
      case 3: return 'Revise as configurações e confirme o agendamento';
      default: return '';
    }
  };

  // Calculate predicted metrics
  const predictedClicks = selectedAudience && selectedTemplate ? 
    Math.round(config.quantity * (selectedAudience.ctr || 0.03)) : 0;
  const predictedRevenue = selectedAudience && selectedTemplate ?
    Math.round(predictedClicks * (selectedAudience.erpm || 150)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {step + 1}
              </div>
              {getStepTitle()}
            </div>
            {editingSlot && (
              <Badge variant="outline" className="ml-auto">Editando</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Step 0: Date & Time Selection */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Datas da Campanha</Label>
                  <div className="border rounded-lg p-4">
                    <Calendar
                      mode="multiple"
                      selected={config.selectedDates}
                      onSelect={(dates) => handleDateSelect(dates || [])}
                      disabled={(date) => date < new Date()}
                      className="rounded-md"
                    />
                  </div>
                  {config.selectedDates.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {config.selectedDates.length} data(s) selecionada(s)
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Horário de Envio</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {state.anchorTimes.map((time) => (
                      <Button
                        key={time}
                        variant={config.selectedTime === time ? "default" : "outline"}
                        onClick={() => setConfig(prev => ({ ...prev, selectedTime: time }))}
                        className="justify-start"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {time}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Resumo da Seleção</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>📅 {config.selectedDates.length} data(s) selecionada(s)</p>
                      <p>🕒 Horário: {config.selectedTime}</p>
                      {config.selectedDates.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Datas:</p>
                          {config.selectedDates.slice(0, 3).map(date => (
                            <p key={date.toISOString()} className="text-xs">
                              • {format(date, 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          ))}
                          {config.selectedDates.length > 3 && (
                            <p className="text-xs">... e mais {config.selectedDates.length - 3}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Audience Selection */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Audience Type Tabs */}
              <Tabs value={config.audienceType} onValueChange={(value: any) => setConfig(prev => ({ ...prev, audienceType: value }))}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="segments">Segmentos</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                  <TabsTrigger value="lists">Listas</TabsTrigger>
                </TabsList>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Buscar ${config.audienceType}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <TabsContent value="segments" className="mt-4">
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredAudienceData().map((segment: any) => {
                      const status = getAudienceStatus(segment);
                      return (
                        <Card 
                          key={segment.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            status.status === 'violation' ? 'border-destructive' : 
                            status.status === 'cooldown' ? 'border-warning' : 'hover:border-primary'
                          }`}
                          onClick={() => status.status === 'available' && handleAudienceSelect(segment)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{segment.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    {(segment.size / 1000).toFixed(0)}k
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground">{segment.description}</p>
                                
                                <div className="flex gap-2 text-xs">
                                  <span>CTR: {((segment.ctr || 0.03) * 100).toFixed(1)}%</span>
                                  <span>•</span>
                                  <span>ERPM: R$ {(segment.erpm || 150).toFixed(0)}</span>
                                  <span>•</span>
                                  <span>RFM: {segment.rfm || 'N/A'}</span>
                                </div>
                                
                                {segment.tags && (
                                  <div className="flex gap-1 flex-wrap">
                                    {segment.tags.slice(0, 3).map((tag: string) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="ml-4 flex flex-col items-end gap-2">
                                {status.status === 'available' && (
                                  <CheckCircle className="h-5 w-5 text-success" />
                                )}
                                {status.status === 'cooldown' && (
                                  <Clock className="h-5 w-5 text-warning" />
                                )}
                                {status.status === 'violation' && (
                                  <AlertTriangle className="h-5 w-5 text-destructive" />
                                )}
                                <span className={`text-xs ${
                                  status.status === 'available' ? 'text-success' :
                                  status.status === 'cooldown' ? 'text-warning' : 'text-destructive'
                                }`}>
                                  {status.message}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="tags" className="mt-4">
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredAudienceData().map((tag: any) => (
                      <Card 
                        key={tag.id}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                        onClick={() => handleAudienceSelect(tag)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{tag.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {(tag.size / 1000).toFixed(0)}k contatos
                              </p>
                            </div>
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {(tag.size / 1000).toFixed(0)}k
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="lists" className="mt-4">
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredAudienceData().map((list: any) => (
                      <Card 
                        key={list.id}
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                        onClick={() => handleAudienceSelect(list)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{list.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {(list.size / 1000).toFixed(0)}k contatos
                              </p>
                            </div>
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {(list.size / 1000).toFixed(0)}k
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Selected Audience Info */}
              {selectedAudience && (
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{selectedAudience.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {(selectedAudience.size / 1000).toFixed(0)}k contatos
                          {selectedAudience.ctr && ` • CTR ${(selectedAudience.ctr * 100).toFixed(1)}%`}
                        </p>
                      </div>
                      <Badge variant="outline">{config.audienceType}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template Filter */}
              <div className="flex gap-2">
                <Button
                  variant={templateFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTemplateFilter('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={templateFilter === 'promo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTemplateFilter('promo')}
                >
                  Promoções
                </Button>
                <Button
                  variant={templateFilter === 'newsletter' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTemplateFilter('newsletter')}
                >
                  Newsletter
                </Button>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {filteredTemplates().map((template) => (
                  <TemplatePreview
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    onGenerateVariation={() => console.log('[SlotWizard] Generate variation for:', template.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Campaign Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Resumo da Campanha</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Datas</Label>
                        <div className="mt-1">
                          {config.selectedDates.slice(0, 3).map(date => (
                            <div key={date.toISOString()} className="text-sm">
                              📅 {format(date, 'dd/MM/yyyy', { locale: ptBR })} às {config.selectedTime}
                            </div>
                          ))}
                          {config.selectedDates.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              ... e mais {config.selectedDates.length - 3} data(s)
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Público</Label>
                        <div className="mt-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{config.audienceType}</Badge>
                            <span className="font-medium">{selectedAudience?.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {(selectedAudience?.size / 1000).toFixed(0)}k contatos totais
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Template</Label>
                        <div className="mt-1">
                          <div className="font-medium">
                            {mockTemplates.find(t => t.id === selectedTemplate)?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Score: {mockTemplates.find(t => t.id === selectedTemplate)?.score}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Metrics */}
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-medium mb-3">Previsões por Envio</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Contatos:</span>
                            <span className="font-medium">{config.quantity.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Cliques:</span>
                            <span className="font-medium">{predictedClicks.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Receita:</span>
                            <span className="font-bold text-primary">R$ {predictedRevenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-success/5 rounded-lg">
                        <h4 className="font-medium mb-3">Total da Campanha</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total de Envios:</span>
                            <span className="font-medium">
                              {(config.quantity * config.selectedDates.length).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total de Cliques:</span>
                            <span className="font-medium">
                              {(predictedClicks * config.selectedDates.length).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Receita Total:</span>
                            <span className="font-bold text-success text-lg">
                              R$ {(predictedRevenue * config.selectedDates.length).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quantity Configuration */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Label htmlFor="final-quantity">Quantidade de Envios por Data</Label>
                    <div className="space-y-2">
                      <Slider
                        id="final-quantity"
                        min={100}
                        max={selectedAudience?.size || 10000}
                        step={100}
                        value={[config.quantity]}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, quantity: value[0] }))}
                      />
                      <div className="text-sm text-muted-foreground">
                        {config.quantity.toLocaleString()} de {selectedAudience?.size.toLocaleString()} contatos
                        ({((config.quantity / selectedAudience?.size) * 100).toFixed(1)}% da base)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Batch Actions */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-medium mb-4">Ações em Lote</h4>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleDuplicateDay}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicar para Dia Seguinte
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDuplicateWeek}
                      className="flex items-center gap-2"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Duplicar para Próxima Semana
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Estas ações criarão campanhas adicionais mantendo as mesmas configurações
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  Voltar
                </Button>
              )}
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {step < 3 && (
                <Button 
                  onClick={handleNext}
                  disabled={
                    (step === 0 && config.selectedDates.length === 0) ||
                    (step === 1 && !selectedAudience) ||
                    (step === 2 && !selectedTemplate)
                  }
                >
                  {step === 2 ? 'Revisar' : 'Próximo'}
                </Button>
              )}
              
              {step === 3 && (
                <Button 
                  onClick={handleSave}
                  disabled={!selectedAudience || !selectedTemplate || config.selectedDates.length === 0}
                  className="bg-success hover:bg-success/90"
                >
                  {editingSlot ? 'Atualizar Campanha' : 'Salvar Campanha'}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}