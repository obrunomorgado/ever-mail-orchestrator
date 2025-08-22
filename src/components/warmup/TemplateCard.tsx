import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateCardProps {
  subject: string;
  preview: string;
  cta: string;
}

export function TemplateCard({ subject, preview, cta }: TemplateCardProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    const templateText = `Assunto: ${subject}\n\nConteúdo: ${preview}\n\nCTA: ${cta}`;
    navigator.clipboard.writeText(templateText);
    toast({
      title: "Template copiado!",
      description: "O template foi copiado para a área de transferência."
    });
  };

  return (
    <Card className="transition-all hover:shadow-md border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground">
          {subject}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {preview}
        </p>
        
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Call to Action:</p>
          <p className="text-sm font-medium text-primary">
            {cta}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-3"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}