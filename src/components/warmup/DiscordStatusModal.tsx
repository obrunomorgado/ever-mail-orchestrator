import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface DiscordStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    date: string;
    project: string;
    currentCap: number;
    gmailState: "verde" | "amarelo" | "vermelho";
    spamRate: number;
    bounceRate: number;
    action: string;
    newCap: number;
  };
}

export function DiscordStatusModal({ open, onOpenChange, data }: DiscordStatusModalProps) {
  const { toast } = useToast();
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    const stateEmoji = {
      verde: "🟢",
      amarelo: "🟡", 
      vermelho: "🔴"
    };

    const text = `${data.date} • ${data.project} • Cap ${data.currentCap.toLocaleString()} • Gmail: ${stateEmoji[data.gmailState]} • Spam ${(data.spamRate * 100).toFixed(3)}% • Bounce ${data.bounceRate.toFixed(1)}% • Ação: ${data.action} (novo cap ${data.newCap.toLocaleString()}).`;
    
    setStatusText(text);
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(statusText);
    toast({
      title: "Status copiado!",
      description: "O status foi copiado para a área de transferência."
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-info" />
            Status para Discord
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Status formatado para Discord:
            </label>
            <Textarea
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              rows={4}
              className="mt-2 font-mono text-sm"
            />
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Preview:</h4>
            <div className="p-3 bg-card border border-border rounded text-sm font-mono break-all">
              {statusText}
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>Dica:</strong> Você pode editar o texto acima antes de copiar.</p>
            <p>Formato sugerido: Data • Projeto • Cap atual • Estado Gmail • Métricas • Ação</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar para Clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}