import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, Tag, List, Star, AlertTriangle, Clock } from 'lucide-react';
import { QuickSegment } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface SegmentSelectorProps {
  segments: QuickSegment[];
  selectedSegment?: QuickSegment;
  onSelect: (segment: QuickSegment) => void;
  isCompact?: boolean;
}

export function SegmentSelector({ 
  segments, 
  selectedSegment, 
  onSelect,
  isCompact = false 
}: SegmentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredSegments = segments.filter(segment => {
    const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || segment.type === typeFilter;
    const matchesFavorites = !showFavoritesOnly || segment.isFavorite;
    
    return matchesSearch && matchesType && matchesFavorites;
  });

  // Ordenar por favoritos primeiro, depois por último uso
  const sortedSegments = [...filteredSegments].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
  });

  const getTypeIcon = (type: QuickSegment['type']) => {
    switch (type) {
      case 'segment': return Users;
      case 'tag': return Tag;
      case 'list': return List;
      default: return Users;
    }
  };

  const getStatusColor = (status: QuickSegment['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'cooldown': return 'warning';
      case 'frequency_cap': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (segment: QuickSegment) => {
    switch (segment.status) {
      case 'active': return 'Ativo';
      case 'cooldown': return `Cooldown até ${new Date(segment.cooldownUntil!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      case 'frequency_cap': return segment.frequencyViolation || 'Limite de frequência';
      default: return 'Desconhecido';
    }
  };

  if (isCompact) {
    return (
      <div className="space-y-2">
        {selectedSegment ? (
          <div 
            className="p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelect(selectedSegment)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {React.createElement(getTypeIcon(selectedSegment.type), { 
                  className: "h-4 w-4 text-muted-foreground" 
                })}
                {selectedSegment.isFavorite && (
                  <Star className="h-3 w-3 text-warning fill-warning" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedSegment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedSegment.count.toLocaleString()} contatos
                </p>
              </div>
              <Badge variant={getStatusColor(selectedSegment.status) as any} className="text-xs">
                {getStatusText(selectedSegment)}
              </Badge>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            Selecionar segmento...
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar segmentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={typeFilter === 'segment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('segment')}
          >
            <Users className="h-3 w-3 mr-1" />
            Segmentos
          </Button>
          <Button
            variant={typeFilter === 'tag' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('tag')}
          >
            <Tag className="h-3 w-3 mr-1" />
            Tags
          </Button>
          <Button
            variant={typeFilter === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('list')}
          >
            <List className="h-3 w-3 mr-1" />
            Listas
          </Button>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star className="h-3 w-3 mr-1" />
            Favoritos
          </Button>
        </div>
      </div>

      {/* Segments List */}
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {sortedSegments.map((segment) => {
            const TypeIcon = getTypeIcon(segment.type);
            const isSelected = selectedSegment?.id === segment.id;
            const hasIssues = segment.status !== 'active';

            return (
              <div
                key={segment.id}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                  isSelected && "border-primary bg-primary/5",
                  hasIssues && "border-warning/50 bg-warning/5"
                )}
                onClick={() => onSelect(segment)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon and Favorite */}
                  <div className="flex flex-col items-center gap-1">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                    {segment.isFavorite && (
                      <Star className="h-3 w-3 text-warning fill-warning" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{segment.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize ml-2">
                        {segment.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {segment.count.toLocaleString()} contatos
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(segment.lastUsed).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(segment.status) as any} className="text-xs">
                        {getStatusText(segment)}
                      </Badge>
                      {hasIssues && (
                        <AlertTriangle className="h-3 w-3 text-warning" />
                      )}
                    </div>
                    
                    {/* Warning messages */}
                    {segment.status === 'cooldown' && (
                      <p className="text-xs text-warning mt-1">
                        ⏰ Segmento em período de cooldown
                      </p>
                    )}
                    {segment.status === 'frequency_cap' && (
                      <p className="text-xs text-destructive mt-1">
                        🚫 {segment.frequencyViolation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {sortedSegments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum segmento encontrado</p>
              <p className="text-xs">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}