import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Star, TrendingUp, Clock, Filter } from 'lucide-react';
import { DispatchTemplate } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  templates: DispatchTemplate[];
  selectedTemplate?: DispatchTemplate;
  onSelect: (template: DispatchTemplate) => void;
  isCompact?: boolean;
}

export function TemplateSelector({ 
  templates, 
  selectedTemplate, 
  onSelect,
  isCompact = false 
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar por performance (CTR) e último uso
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    // Priorizar templates usados recentemente com bom CTR
    const aScore = a.metrics.ctr * 10 + (new Date(a.lastUsed).getTime() / 1000000000);
    const bScore = b.metrics.ctr * 10 + (new Date(b.lastUsed).getTime() / 1000000000);
    return bScore - aScore;
  });

  const handleTemplateClick = (template: DispatchTemplate) => {
    onSelect(template);
  };

  const getCTRColor = (ctr: number) => {
    if (ctr >= 5) return 'text-success';
    if (ctr >= 3) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getCTRBadgeVariant = (ctr: number) => {
    if (ctr >= 5) return 'default';
    if (ctr >= 3) return 'secondary';
    return 'outline';
  };

  if (isCompact) {
    return (
      <div className="space-y-2">
        {selectedTemplate ? (
          <div 
            className="p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelect(selectedTemplate)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-8 rounded border bg-cover bg-center"
                style={{ backgroundImage: `url(${selectedTemplate.thumbnail})` }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedTemplate.name}</p>
                <p className="text-xs text-muted-foreground">{selectedTemplate.category}</p>
              </div>
              <Badge variant={getCTRBadgeVariant(selectedTemplate.metrics.ctr)} className="text-xs">
                {selectedTemplate.metrics.ctr}% CTR
              </Badge>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full justify-start">
            <Search className="h-4 w-4 mr-2" />
            Selecionar template...
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
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            Todos
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {sortedTemplates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "p-3 border rounded-lg cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                selectedTemplate?.id === template.id && "border-primary bg-primary/5"
              )}
              onClick={() => handleTemplateClick(template)}
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div 
                  className="w-16 h-12 rounded border bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${template.thumbnail})` }}
                />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm truncate">{template.name}</h4>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {template.subject}
                  </p>
                  
                  {/* Metrics */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className={getCTRColor(template.metrics.ctr)}>
                          {template.metrics.ctr}% CTR
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📧</span>
                        <span className="text-muted-foreground">
                          {template.metrics.openRate}% OR
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(template.lastUsed).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  {/* Performance indicator */}
                  {template.metrics.ctr >= 5 && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="text-xs text-warning font-medium">Alta performance</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sortedTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum template encontrado</p>
              <p className="text-xs">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}