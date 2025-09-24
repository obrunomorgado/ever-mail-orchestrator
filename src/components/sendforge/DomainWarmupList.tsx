import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DomainWarmup } from "@/types/sendforge";
import { Thermometer, Upload, Link, CheckCircle, AlertTriangle, XCircle, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";

interface DomainWarmupListProps {
  domains: DomainWarmup[];
}

export function DomainWarmupList({ domains }: DomainWarmupListProps) {
  const [uploadingDomain, setUploadingDomain] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getPhaseLabel = (phase: number) => {
    if (phase <= 7) return `D${phase} - Inicial`;
    if (phase <= 14) return `D${phase} - Crescimento`;
    if (phase <= 21) return `D${phase} - Estabilização`;
    return `D${phase} - Produção`;
  };

  const handleTemplateUpload = (domainId: string) => {
    setUploadingDomain(domainId);
    // Simulate upload
    setTimeout(() => {
      setUploadingDomain(null);
    }, 2000);
  };

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-primary" />
          Warm-Up Manager
        </CardTitle>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Adicionar Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {domains.map((domain) => {
            const StatusIcon = getStatusIcon(domain.status);
            return (
              <div key={domain.id} className="border border-border rounded-lg p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(domain.status)}`} />
                    <div>
                      <div className="font-medium">{domain.domain}</div>
                      <div className="text-sm text-muted-foreground">{domain.provider}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getPhaseLabel(domain.phase)}</Badge>
                    <Badge 
                      variant={domain.status === 'healthy' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {domain.status}
                    </Badge>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso do aquecimento</span>
                    <span className="font-medium">{domain.progress}%</span>
                  </div>
                  <Progress value={domain.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Volume: {domain.currentVolume.toLocaleString()}</span>
                    <span>Meta: {domain.targetVolume.toLocaleString()}</span>
                  </div>
                </div>

                {/* Reputation Metrics */}
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{(domain.reputation.spamRate * 100).toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground">Spam</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{domain.reputation.bounceRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Bounce</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{domain.reputation.openRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Open</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{domain.reputation.replyRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Reply</div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={domain.useRealLinks} 
                        id={`real-links-${domain.id}`}
                      />
                      <label 
                        htmlFor={`real-links-${domain.id}`}
                        className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
                      >
                        <Link className="h-3 w-3" />
                        Usar links reais
                      </label>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {new Date(domain.lastActivity).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleTemplateUpload(domain.id)}
                      disabled={uploadingDomain === domain.id}
                    >
                      {uploadingDomain === domain.id ? 'Enviando...' : 'Template'}
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Métricas
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-bold text-success">{domains.filter(d => d.status === 'healthy').length}</div>
              <div className="text-xs text-muted-foreground">Saudáveis</div>
            </div>
            <div>
              <div className="font-bold text-warning">{domains.filter(d => d.status === 'warning').length}</div>
              <div className="text-xs text-muted-foreground">Atenção</div>
            </div>
            <div>
              <div className="font-bold text-destructive">{domains.filter(d => d.status === 'critical').length}</div>
              <div className="text-xs text-muted-foreground">Críticos</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}