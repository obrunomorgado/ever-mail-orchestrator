import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Search, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Mail, 
  Eye,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { SegmentSelector } from './SegmentSelector';
import { ScheduledDispatch, DispatchTemplate, QuickSegment } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface QuickConfigSidebarProps {
  dispatch?: ScheduledDispatch;
  isVisible: boolean;
  onClose: () => void;
  onUpdate: (dispatch: ScheduledDispatch) => void;
  onSave: () => void;
  templates: DispatchTemplate[];
  segments: QuickSegment[];
}

export function QuickConfigSidebar({
  dispatch,
  isVisible,
  onClose,
  onUpdate,
  onSave,
  templates,
  segments
}: QuickConfigSidebarProps) {
  const [localDispatch, setLocalDispatch] = useState<ScheduledDispatch | undefined>(dispatch);
  const [customSubject, setCustomSubject] = useState('');
  const [customPreheader, setCustomPreheader] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (dispatch) {
      setLocalDispatch(dispatch);
      setCustomSubject(dispatch.customSubject || dispatch.template?.subject || '');
      setCustomPreheader(dispatch.template?.preheader || '');
      setHasChanges(false);
    }
  }, [dispatch]);

  const handleTemplateSelect = (template: DispatchTemplate) => {
    if (!localDispatch) return;

    const updated = {
      ...localDispatch,
      template,
      customSubject: customSubject !== template.subject ? customSubject : undefined
    };
    
    setLocalDispatch(updated);
    onUpdate(updated);
    setHasChanges(true);
  };

  const handleSegmentSelect = (segment: QuickSegment) => {
    if (!localDispatch) return;

    const updated = {
      ...localDispatch,
      segment,
      predictedClicks: Math.floor(segment.count * 0.032),
      predictedRevenue: Math.floor(segment.count * 0.032 * 45)
    };
    
    setLocalDispatch(updated);
    onUpdate(updated);
    setHasChanges(true);
  };

  const handleSubjectChange = (value: string) => {
    setCustomSubject(value);
    if (!localDispatch) return;

    const updated = {
      ...localDispatch,
      customSubject: value !== localDispatch.template?.subject ? value : undefined
    };
    
    setLocalDispatch(updated);
    onUpdate(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave();
    setHasChanges(false);
  };

  const getValidationStatus = () => {
    if (!localDispatch) return { isValid: false, issues: ['Nenhum disparo selecionado'] };

    const issues: string[] = [];
    
    if (!localDispatch.template) issues.push('Template não selecionado');
    if (!localDispatch.segment) issues.push('Segmento não selecionado');
    if (!customSubject.trim()) issues.push('Assunto vazio');
    if (localDispatch.segment?.status === 'cooldown') issues.push('Segmento em cooldown');
    if (localDispatch.segment?.status === 'frequency_cap') issues.push('Violação de frequência');

    return {
      isValid: issues.length === 0,
      issues
    };
  };

  const validation = getValidationStatus();

  if (!isVisible || !localDispatch) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Configuração Rápida</h3>
            <p className="text-sm text-muted-foreground">
              {localDispatch.timeSlot} • {new Date(localDispatch.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Status Card */}
          <Card className={cn(
            "border-l-4",
            validation.isValid ? "border-l-success bg-success/5" : "border-l-warning bg-warning/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {validation.isValid ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
                <span className="font-medium text-sm">
                  {validation.isValid ? 'Pronto para agendar' : 'Configuração incompleta'}
                </span>
              </div>
              {!validation.isValid && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {validation.issues.map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Template</Label>
            <TemplateSelector
              templates={templates}
              selectedTemplate={localDispatch.template}
              onSelect={handleTemplateSelect}
            />
          </div>

          {/* Subject Customization */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Assunto</Label>
            <Input
              value={customSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              placeholder="Digite o assunto do email..."
              className="text-sm"
            />
            {localDispatch.template && customSubject !== localDispatch.template.subject && (
              <p className="text-xs text-warning">
                ⚠️ Assunto personalizado (diferente do template)
              </p>
            )}
          </div>

          {/* Preheader */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preheader</Label>
            <Input
              value={customPreheader}
              onChange={(e) => setCustomPreheader(e.target.value)}
              placeholder="Texto de preview..."
              className="text-sm"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Carregado automaticamente do template
            </p>
          </div>

          <Separator />

          {/* Segment Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Segmento</Label>
            <SegmentSelector
              segments={segments}
              selectedSegment={localDispatch.segment}
              onSelect={handleSegmentSelect}
            />
          </div>

          {/* Predictions */}
          {localDispatch.predictedClicks && localDispatch.predictedRevenue && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Previsões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Cliques esperados</span>
                  </div>
                  <Badge variant="outline">{localDispatch.predictedClicks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <span className="text-sm">Receita estimada</span>
                  </div>
                  <Badge variant="outline">R$ {localDispatch.predictedRevenue.toLocaleString()}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template Preview */}
          {localDispatch.template && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview do Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{localDispatch.template.sender.name}</span>
                    <span className="text-xs text-muted-foreground">
                      &lt;{localDispatch.template.sender.email}&gt;
                    </span>
                  </div>
                  <div 
                    className="w-full h-32 rounded border bg-cover bg-center"
                    style={{ backgroundImage: `url(${localDispatch.template.thumbnail})` }}
                  />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>CTR:</strong> {localDispatch.template.metrics.ctr}%</p>
                    <p><strong>Taxa de Abertura:</strong> {localDispatch.template.metrics.openRate}%</p>
                    <p><strong>Último uso:</strong> {new Date(localDispatch.template.lastUsed).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSave}
            disabled={!validation.isValid}
          >
            {hasChanges ? 'Salvar' : 'Fechar'}
          </Button>
        </div>
      </div>
    </div>
  );
}