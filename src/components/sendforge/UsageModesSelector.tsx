import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UsageMode } from "@/types/sendforge";
import { Zap, ShoppingCart, Link, CheckCircle, Star, Crown } from "lucide-react";
import { useState } from "react";

interface UsageModesSelectorProps {
  modes: UsageMode[];
}

export function UsageModesSelector({ modes }: UsageModesSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<string>('dfy');
  const [showMarketplace, setShowMarketplace] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'ShoppingCart': return ShoppingCart;
      case 'Link': return Link;
      default: return Zap;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'available': return Star;
      case 'coming-soon': return Crown;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'available': return 'text-info';
      case 'coming-soon': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const marketplaceDomains = [
    {
      id: '1',
      domain: 'newsletter-pro.com',
      age: '45 dias',
      reputation: 94,
      volume: '15K/dia',
      price: '$299',
      provider: 'Gmail',
      metrics: { open: 28.5, bounce: 0.8, spam: 0.01 }
    },
    {
      id: '2',
      domain: 'updates-premium.net',
      age: '38 dias',
      reputation: 91,
      volume: '10K/dia',
      price: '$199',
      provider: 'Gmail',
      metrics: { open: 26.2, bounce: 1.1, spam: 0.02 }
    },
    {
      id: '3',
      domain: 'alerts-secure.io',
      age: '52 dias',
      reputation: 96,
      volume: '20K/dia',
      price: '$499',
      provider: 'Gmail',
      metrics: { open: 31.8, bounce: 0.5, spam: 0.005 }
    }
  ];

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Modos de Uso
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Escolha como deseja usar o SendForge
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {modes.map((mode) => {
            const IconComponent = getIcon(mode.icon);
            const StatusIcon = getStatusIcon(mode.status);
            const isSelected = selectedMode === mode.id;
            
            return (
              <div
                key={mode.id}
                className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{mode.name}</h3>
                      <StatusIcon className={`h-4 w-4 ${getStatusColor(mode.status)}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {mode.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {mode.features.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{mode.features.length - 3} recursos adicionais
                    </div>
                  )}
                </div>

                {/* Pricing & Setup */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço:</span>
                    <span className="font-medium">{mode.pricing}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Setup:</span>
                    <span className="font-medium">{mode.setup}</span>
                  </div>
                </div>

                {/* Status */}
                <Badge 
                  variant={mode.status === 'active' ? 'default' : 'secondary'}
                  className="w-full justify-center mb-4"
                >
                  {mode.status === 'active' && 'Ativo'}
                  {mode.status === 'available' && 'Disponível'}
                  {mode.status === 'coming-soon' && 'Em breve'}
                </Badge>

                {/* Action Button */}
                {mode.id === 'pre-warmed' ? (
                  <Dialog open={showMarketplace} onOpenChange={setShowMarketplace}>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant={isSelected ? 'default' : 'outline'}>
                        Ver Marketplace
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Marketplace - Domínios Pré-Aquecidos</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {marketplaceDomains.map((domain) => (
                          <div key={domain.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-medium">{domain.domain}</div>
                                <div className="text-sm text-muted-foreground">
                                  {domain.provider} • Aquecido há {domain.age}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-primary">{domain.price}</div>
                                <div className="text-sm text-muted-foreground">Volume: {domain.volume}</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 mb-3">
                              <div className="text-center">
                                <div className="font-medium text-success">{domain.reputation}</div>
                                <div className="text-xs text-muted-foreground">Reputação</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{domain.metrics.open}%</div>
                                <div className="text-xs text-muted-foreground">Open Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{domain.metrics.bounce}%</div>
                                <div className="text-xs text-muted-foreground">Bounce Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">{(domain.metrics.spam * 100).toFixed(2)}%</div>
                                <div className="text-xs text-muted-foreground">Spam Rate</div>
                              </div>
                            </div>
                            
                            <Button className="w-full">
                              Comprar Domínio
                            </Button>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={isSelected ? 'default' : 'outline'}
                    disabled={mode.status === 'coming-soon'}
                  >
                    {mode.status === 'active' ? 'Configurar' : 
                     mode.status === 'available' ? 'Selecionar' : 'Em breve'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Mode Info */}
        {selectedMode && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="font-medium">Modo Selecionado: {modes.find(m => m.id === selectedMode)?.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {modes.find(m => m.id === selectedMode)?.description}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}