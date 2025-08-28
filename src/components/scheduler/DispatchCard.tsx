import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Users, TrendingUp, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { ScheduledDispatch } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface DispatchCardProps {
  dispatch: ScheduledDispatch;
  onUpdate: (dispatch: ScheduledDispatch) => void;
  onSelect: (dispatch: ScheduledDispatch) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  hasSubjectConflict?: boolean;
}

export function DispatchCard({ 
  dispatch, 
  onUpdate, 
  onSelect, 
  onDelete,
  isSelected,
  isDragging,
  hasSubjectConflict 
}: DispatchCardProps) {
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [editSubject, setEditSubject] = useState(dispatch.customSubject || dispatch.template?.subject || '');

  const handleSaveSubject = () => {
    onUpdate({
      ...dispatch,
      customSubject: editSubject !== dispatch.template?.subject ? editSubject : undefined
    });
    setIsEditingSubject(false);
  };

  const handleCancelEdit = () => {
    setEditSubject(dispatch.customSubject || dispatch.template?.subject || '');
    setIsEditingSubject(false);
  };

  const getStatusColor = () => {
    switch (dispatch.status) {
      case 'scheduled': return 'success';
      case 'draft': return 'warning';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (dispatch.status) {
      case 'scheduled': return 'Agendado';
      case 'draft': return 'Rascunho';
      case 'error': return 'Erro';
      case 'sent': return 'Enviado';
      default: return 'Desconhecido';
    }
  };

  const currentSubject = dispatch.customSubject || dispatch.template?.subject || 'Sem assunto';

  return (
    <Card 
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md border-l-4',
        isSelected && 'ring-2 ring-primary',
        isDragging && 'opacity-50 rotate-2',
        hasSubjectConflict && 'border-l-destructive bg-destructive/5',
        dispatch.status === 'scheduled' && 'border-l-success',
        dispatch.status === 'draft' && 'border-l-warning',
        dispatch.status === 'error' && 'border-l-destructive'
      )}
      onClick={() => onSelect(dispatch)}
    >
      {/* Header com horário e status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{dispatch.timeSlot}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasSubjectConflict && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          <Badge variant={getStatusColor() as any} className="text-xs">
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Template preview */}
      {dispatch.template && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-12 h-8 rounded border bg-cover bg-center"
              style={{ backgroundImage: `url(${dispatch.template.thumbnail})` }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{dispatch.template.name}</p>
              <p className="text-xs text-muted-foreground">{dispatch.template.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Assunto editável */}
      <div className="mb-3">
        {isEditingSubject ? (
          <div className="flex items-center gap-1">
            <Input
              value={editSubject}
              onChange={(e) => setEditSubject(e.target.value)}
              className="text-sm h-8"
              placeholder="Digite o assunto..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveSubject();
                if (e.key === 'Escape') handleCancelEdit();
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleSaveSubject}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleCancelEdit}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <p className={cn(
              "text-sm flex-1 leading-relaxed",
              hasSubjectConflict && "text-destructive font-medium"
            )}>
              {currentSubject}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingSubject(true);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Segmento */}
      {dispatch.segment && (
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{dispatch.segment.name}</span>
          <Badge variant="outline" className="text-xs">
            {dispatch.segment.count.toLocaleString()}
          </Badge>
        </div>
      )}

      {/* Métricas previstas */}
      {dispatch.predictedClicks && dispatch.predictedRevenue && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{dispatch.predictedClicks} cliques</span>
          </div>
          <span>R$ {dispatch.predictedRevenue.toLocaleString()}</span>
        </div>
      )}

      {/* Indicador de conflito */}
      {hasSubjectConflict && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
          ⚠️ Assunto duplicado detectado
        </div>
      )}
    </Card>
  );
}