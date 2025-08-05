import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Search, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePlanner, CampaignSegment } from '@/contexts/PlannerContext';
import { TemplatePreview, mockTemplates } from './TemplatePreview';

interface SlotWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  timeSlot: string;
  segments: CampaignSegment[];
}

interface SlotConfig {
  quantity: number;
  selectedTime: string;
  cooldownOverride?: number;
}

export function SlotWizard({ isOpen, onOpenChange, date, timeSlot, segments }: SlotWizardProps) {
  const { createSlot, state } = usePlanner();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSegment, setSelectedSegment] = useState<CampaignSegment | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [config, setConfig] = useState<SlotConfig>({
    quantity: 1000,
    selectedTime: timeSlot,
    cooldownOverride: undefined
  });

  // Filter segments based on search
  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    segment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check if segment has cooldown or frequency violations
  const getSegmentStatus = useCallback((segment: CampaignSegment) => {
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

  const handleSegmentSelect = (segment: CampaignSegment) => {
    setSelectedSegment(segment);
    setConfig(prev => ({
      ...prev,
      quantity: Math.min(prev.quantity, segment.size)
    }));
    setStep(2);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleSave = () => {
    if (!selectedSegment || !selectedTemplate) return;
    
    createSlot(date, config.selectedTime, selectedSegment.id, selectedTemplate);
    
    // Reset wizard state
    setStep(1);
    setSelectedSegment(null);
    setSelectedTemplate(null);
    setSearchTerm('');
    setConfig({
      quantity: 1000,
      selectedTime: timeSlot,
      cooldownOverride: undefined
    });
    
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedTemplate(null);
    }
  };

  const handleCancel = () => {
    setStep(1);
    setSelectedSegment(null);
    setSelectedTemplate(null);
    setSearchTerm('');
    onOpenChange(false);
  };

  const generateVariation = () => {
    // Mock AI variation generation
    console.log('[SlotWizard] Generating AI variation for template:', selectedTemplate);
    // In real app, this would call an AI service to create template variations
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Escolher Segmento' : 'Escolher Template'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? `Selecione o segmento para ${date} às ${timeSlot}`
              : `Selecione o template para "${selectedSegment?.name}"`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 1 && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar segmentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Segments List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredSegments.map((segment) => {
                  const status = getSegmentStatus(segment);
                  return (
                    <Card 
                      key={segment.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        status.status === 'violation' ? 'border-destructive' : 
                        status.status === 'cooldown' ? 'border-warning' : 'hover:border-primary'
                      }`}
                      onClick={() => status.status === 'available' && handleSegmentSelect(segment)}
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
                              <span>CTR: {(segment.ctr * 100).toFixed(1)}%</span>
                              <span>•</span>
                              <span>ERPM: R$ {segment.erpm.toFixed(0)}</span>
                              <span>•</span>
                              <span>RFM: {segment.rfm}</span>
                            </div>
                            
                            <div className="flex gap-1 flex-wrap">
                              {segment.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Selected Segment Info */}
              {selectedSegment && (
                <Card className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{selectedSegment.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {(selectedSegment.size / 1000).toFixed(0)}k contatos • CTR {(selectedSegment.ctr * 100).toFixed(1)}%
                        </p>
                      </div>
                      <Badge variant="outline">{selectedSegment.rfm}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {mockTemplates.map((template) => (
                  <TemplatePreview
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    onGenerateVariation={generateVariation}
                  />
                ))}
              </div>

              <Separator />

              {/* Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium">Configurações</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade de Envios</Label>
                    <div className="space-y-2">
                      <Slider
                        id="quantity"
                        min={100}
                        max={selectedSegment?.size || 10000}
                        step={100}
                        value={[config.quantity]}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, quantity: value[0] }))}
                      />
                      <div className="text-sm text-muted-foreground">
                        {config.quantity.toLocaleString()} de {selectedSegment?.size.toLocaleString()} contatos
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário</Label>
                    <Select value={config.selectedTime} onValueChange={(value) => setConfig(prev => ({ ...prev, selectedTime: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {state.anchorTimes.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cooldown">Cool-down Override</Label>
                    <Select 
                      value={config.cooldownOverride?.toString() || "default"} 
                      onValueChange={(value) => setConfig(prev => ({ 
                        ...prev, 
                        cooldownOverride: value === "default" ? undefined : parseInt(value) 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão ({state.coolDown} dias)</SelectItem>
                        <SelectItem value="0">Sem cool-down</SelectItem>
                        <SelectItem value="1">1 dia</SelectItem>
                        <SelectItem value="3">3 dias</SelectItem>
                        <SelectItem value="7">7 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2 w-full">
            {step === 2 && (
              <Button variant="outline" onClick={handleBack}>
                Voltar
              </Button>
            )}
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            {step === 1 && (
              <Button disabled={!selectedSegment}>
                Próximo
              </Button>
            )}
            {step === 2 && (
              <Button 
                onClick={handleSave} 
                disabled={!selectedTemplate}
                className="ml-auto"
              >
                Salvar Campanha
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}