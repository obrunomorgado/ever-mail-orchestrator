import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, Clock } from 'lucide-react';

interface TemplateData {
  id: string;
  name: string;
  thumbnail: string;
  openRate: number;
  ctr: number;
  rpm: number;
  score: number;
  optimalTimes: string[];
  description: string;
}

interface TemplatePreviewProps {
  template: TemplateData;
  isSelected?: boolean;
  onClick?: () => void;
  onGenerateVariation?: () => void;
}

// Mock template data with realistic scores
const calculateScore = (openRate: number, ctr: number, rpm: number) => {
  return Math.round((openRate * ctr * rpm) / 100);
};

export function TemplatePreview({ template, isSelected = false, onClick, onGenerateVariation }: TemplatePreviewProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Thumbnail */}
        <div className="relative mb-3">
          <div 
            className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: `url(https://images.unsplash.com/${template.thumbnail}?w=200&h=120&fit=crop)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Blur overlay for thumbnail effect */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
            
            {/* Score overlay */}
            <div className="absolute top-2 right-2 bg-background/90 rounded-full px-2 py-1">
              <div className="text-sm font-bold text-primary flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {template.score}
              </div>
            </div>
            
            {/* Optimal time indicator */}
            {template.optimalTimes.length > 0 && (
              <div className="absolute bottom-2 left-2 bg-success/90 rounded-full px-2 py-1">
                <div className="text-xs text-white flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {template.optimalTimes[0]}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <div>
            <h4 className="font-medium text-sm leading-tight">{template.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
          </div>
          
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium">{(template.openRate * 100).toFixed(1)}%</div>
              <div className="text-muted-foreground">Open</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{(template.ctr * 100).toFixed(1)}%</div>
              <div className="text-muted-foreground">CTR</div>
            </div>
            <div className="text-center">
              <div className="font-medium">R$ {template.rpm.toFixed(0)}</div>
              <div className="text-muted-foreground">RPM</div>
            </div>
          </div>
          
          {/* Tags and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs px-1 py-0">
                Score: {template.score}
              </Badge>
              {template.optimalTimes.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  Best: {template.optimalTimes.join(', ')}
                </Badge>
              )}
            </div>
            
            {onGenerateVariation && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateVariation();
                }}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Variação IA
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock templates data for the component
export const mockTemplates: TemplateData[] = [
  {
    id: 'template-1',
    name: 'Promo Flash Cartão',
    thumbnail: 'photo-1461749280684-dccba630e2f6',
    openRate: 0.28,
    ctr: 0.045,
    rpm: 125.50,
    score: calculateScore(0.28, 0.045, 125.50),
    optimalTimes: ['09:00', '14:00'],
    description: 'Template otimizado para promoções rápidas de cartão de crédito'
  },
  {
    id: 'template-2', 
    name: 'Newsletter Investimentos',
    thumbnail: 'photo-1485827404703-89b55fcc595e',
    openRate: 0.32,
    ctr: 0.038,
    rpm: 89.20,
    score: calculateScore(0.32, 0.038, 89.20),
    optimalTimes: ['20:00'],
    description: 'Template para conteúdo educativo sobre investimentos e empréstimos'
  },
  {
    id: 'template-3',
    name: 'Alerta Urgente',
    thumbnail: 'photo-1487058792275-0ad4aaf24ca7',
    openRate: 0.45,
    ctr: 0.067,
    rpm: 156.80,
    score: calculateScore(0.45, 0.067, 156.80),
    optimalTimes: ['12:00', '15:00'],
    description: 'Template para comunicações urgentes e alertas importantes'
  },
  {
    id: 'template-4',
    name: 'Fechamento Consórcio',
    thumbnail: 'photo-1473091534298-04dcbce3278c',
    openRate: 0.24,
    ctr: 0.052,
    rpm: 210.40,
    score: calculateScore(0.24, 0.052, 210.40),
    optimalTimes: ['16:00', '18:00'],
    description: 'Template especializado para ofertas de consórcio com alta conversão'
  },
  {
    id: 'template-5',
    name: 'Breaking News',
    thumbnail: 'photo-1498050108023-c5249f4df085',
    openRate: 0.38,
    ctr: 0.041,
    rpm: 95.60,
    score: calculateScore(0.38, 0.041, 95.60),
    optimalTimes: ['08:00', '12:00', '20:00'],
    description: 'Template para notícias de última hora e atualizações importantes'
  },
  {
    id: 'template-6',
    name: 'Oferta Personalizada',
    thumbnail: 'photo-1483058712412-4245e9b90334',
    openRate: 0.29,
    ctr: 0.048,
    rpm: 178.90,
    score: calculateScore(0.29, 0.048, 178.90),
    optimalTimes: ['10:00', '15:00'],
    description: 'Template com alto grau de personalização baseado no perfil do usuário'
  }
];