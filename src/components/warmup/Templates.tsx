import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateCard } from "./TemplateCard";
import { contentTemplates, actionMicrocopy } from "@/data/warmupData";
import { Lightbulb, FileText, MessageCircle } from "lucide-react";

export function Templates() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Templates & Microcopy</h1>
        <p className="text-muted-foreground">
          Conteúdos leves e microcopies prontos para seu warmup
        </p>
      </div>

      {/* Templates de Conteúdo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Templates de Conteúdo Leve
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTemplates.map((template, index) => (
              <TemplateCard
                key={index}
                subject={template.subject}
                preview={template.preview}
                cta={template.cta}
              />
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-warning mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Dicas para conteúdo de warmup:</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Conteúdo leve, neutro, HTML simples</li>
                  <li>Sem promessas agressivas ou linguagem promocional forte</li>
                  <li>CTAs suaves e naturais</li>
                  <li>Assuntos curiosos mas não clickbait</li>
                  <li>Foque em valor real, não em venda</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Microcopies de Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-info" />
            Microcopies para Ações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="p-4 border border-success/20 bg-success/5 rounded-lg">
              <h4 className="font-medium text-success mb-2">Avançar Warmup</h4>
              <p className="text-sm text-muted-foreground">
                {actionMicrocopy.avançar}
              </p>
            </div>

            <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
              <h4 className="font-medium text-warning mb-2">Manter Cap</h4>
              <p className="text-sm text-muted-foreground">
                {actionMicrocopy.manter}
              </p>
            </div>

            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Recuar Warmup</h4>
              <p className="text-sm text-muted-foreground">
                {actionMicrocopy.recuar}
              </p>
            </div>

            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Pausar Provedor</h4>
              <p className="text-sm text-muted-foreground">
                {actionMicrocopy.pausar}
              </p>
            </div>

            <div className="p-4 border border-border bg-card rounded-lg">
              <h4 className="font-medium mb-2">Dica de Pauta</h4>
              <p className="text-sm text-muted-foreground">
                {actionMicrocopy.dica_pauta}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemplos de Assuntos por Vertical */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplos de Assuntos por Vertical</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-500">Cartão de Crédito</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  "3 dicas rápidas para seu cartão"
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  "Algo útil que descobri hoje"
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  "Uma pergunta rápida para você"
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-green-500">Empréstimo</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  "Calculadora que você vai gostar"
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  "2 minutos de leitura útil"
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  "Posso compartilhar uma dica?"
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-purple-500">Consórcio</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  "Atualização rápida sobre consórcios"
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  "Simulação que vale a pena"
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  "Pergunta de 30 segundos"
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 text-gray-500">Geral/Outros</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-muted/50 rounded">
                  "Novidade que pode te interessar"
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  "Link útil que encontrei"
                </div>
                <div className="p-2 bg-muted/50 rounded">
                  "Conteúdo de 2 minutos"
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}