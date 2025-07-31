import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { segments } from "@/mocks/demoData";

interface OverlapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segmentAId: string;
  segmentBId: string;
}

export function OverlapModal({ 
  open, 
  onOpenChange, 
  segmentAId, 
  segmentBId 
}: OverlapModalProps) {
  const { toast } = useToast();

  const { segmentA, segmentB, overlapData } = useMemo(() => {
    const segA = segments.find(s => s.id === segmentAId);
    const segB = segments.find(s => s.id === segmentBId);
    
    if (!segA || !segB) {
      return { segmentA: null, segmentB: null, overlapData: null };
    }

    // Mock overlap calculation: 30% of the smaller segment
    const overlapCount = Math.floor(Math.min(segA.size, segB.size) * 0.3);
    const overlapPercentageA = (overlapCount / segA.size) * 100;
    const overlapPercentageB = (overlapCount / segB.size) * 100;

    return {
      segmentA: segA,
      segmentB: segB,
      overlapData: {
        count: overlapCount,
        percentageA: overlapPercentageA,
        percentageB: overlapPercentageB,
        avgPercentage: (overlapPercentageA + overlapPercentageB) / 2
      }
    };
  }, [segmentAId, segmentBId]);

  const getOverlapColor = (percentage: number) => {
    if (percentage < 30) return "bg-green-500";
    if (percentage < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getOverlapStatus = (percentage: number) => {
    if (percentage < 30) return "Baixo";
    if (percentage < 60) return "Médio";
    return "Alto";
  };

  const handleDeduplicate = () => {
    toast({
      title: "Deduplicação iniciada",
      description: `Removendo ${overlapData?.count.toLocaleString()} contatos duplicados...`,
    });
    onOpenChange(false);
  };

  if (!segmentA || !segmentB || !overlapData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Análise de Sobreposição</DialogTitle>
          <DialogDescription>
            Comparando os segmentos "{segmentA.name}" e "{segmentB.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">{segmentA.name}</h4>
              <p className="text-sm text-muted-foreground">
                {segmentA.size.toLocaleString()} contatos
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{segmentB.name}</h4>
              <p className="text-sm text-muted-foreground">
                {segmentB.size.toLocaleString()} contatos
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Sobreposição Detectada</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                overlapData.avgPercentage < 30 
                  ? 'bg-green-100 text-green-800' 
                  : overlapData.avgPercentage < 60 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {getOverlapStatus(overlapData.avgPercentage)}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Contatos em comum</span>
                <span className="font-medium">{overlapData.count.toLocaleString()}</span>
              </div>
              <Progress 
                value={overlapData.avgPercentage} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{overlapData.percentageA.toFixed(1)}% do {segmentA.name}</span>
                <span>{overlapData.percentageB.toFixed(1)}% do {segmentB.name}</span>
              </div>
            </div>
          </div>

          {overlapData.avgPercentage > 30 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Alta sobreposição detectada. 
                Considere deduplicar para evitar spam e otimizar custos.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {overlapData.avgPercentage > 20 && (
            <Button onClick={handleDeduplicate}>
              Deduplicar Agora
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}