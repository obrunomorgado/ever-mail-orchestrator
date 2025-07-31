import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SegmentModuleDocs() {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🚦 EverInbox | Módulo de Segmentos</h1>
        <p className="text-lg text-muted-foreground">
          Permitir que usuários criem segmentos com base em engajamento, origem, comportamento e atributos personalizados 
          <strong> sem operadores lógicos visíveis</strong>, mas com máxima flexibilidade para gerar receita via campanhas de broadcast/newsletter.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✅ 1. Kit Essencial <Badge variant="secondary">campos obrigatórios</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Campos</TableHead>
                <TableHead>Operadores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Engajamento</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline">Aberturas totais</Badge>
                    <Badge variant="outline">Aberturas únicas</Badge>
                    <Badge variant="outline">Cliques totais</Badge>
                    <Badge variant="outline">Cliques únicas</Badge>
                    <div className="text-sm text-muted-foreground">
                      Última abertura ou clique (dias) / Taxa % open/click
                    </div>
                  </div>
                </TableCell>
                <TableCell>≥ • ≤ • entre • vazio</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Origem & Tecnologia</TableCell>
                <TableCell>Provedor, Domínio, Dispositivo, Cliente de e-mail</TableCell>
                <TableCell>é • não é • contém</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Atributos & Tags</TableCell>
                <TableCell>Possui / não possui Tag, Está / não está em Segmento, Campos customizados</TableCell>
                <TableCell>contém • = • vazio</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Histórico de Envio</TableCell>
                <TableCell>Total recebido, Dias desde último envio, Participa de automação?, IP dedicado?</TableCell>
                <TableCell>≥ • ≤ • sim/não</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Listas</TableCell>
                <TableCell>Está / não está na Lista (multi-select)</TableCell>
                <TableCell>é • não é</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Campanhas</TableCell>
                <TableCell>Recebeu / Abriu / Clicou campanha X</TableCell>
                <TableCell>sim • não</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Automações</TableCell>
                <TableCell>Participa da automação, Status (em andamento, concluído, removido)</TableCell>
                <TableCell>é • não é</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 2. Blocos Avançados <Badge>para Publishers Financeiros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li><strong>Eventos (API)</strong> – ex.: concluiu quiz, simulador.</li>
            <li><strong>Últimos N envios</strong> – "Cliques ≥ 2 nos últimos 5 e-mails".</li>
            <li><strong>Pontuação de Engajamento</strong> – score 0-100 (opens, clicks, recência).</li>
            <li><strong>Preferência de Horário</strong> – Morning / Afternoon / Evening.</li>
            <li><strong>Links clicados</strong> – segmentação por URL/slug monetizado.</li>
            <li><strong>Frequency Cap</strong> – evita oversending.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚙️ 3. Interface e Lógica visual (zero AND/OR visível)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Painéis:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">✅ Incluir</Badge>
                    <span className="text-sm">(AND implícito)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">❌ Excluir</Badge>
                    <span className="text-sm">(NOT implícito)</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Botões:</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">➕ Refinar</Badge>
                    <span className="text-sm">(AND)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">🔄 Ampliar</Badge>
                    <span className="text-sm">(OR)</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Feedback:</h4>
              <p className="text-sm text-muted-foreground">
                <span className="text-green-600">Verde = inclusão</span> • 
                <span className="text-red-600"> Vermelho = exclusão</span> • 
                <span className="text-blue-600"> Azul = ampliação</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🛠️ 4. Check-list UX & DEV</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "Autocomplete em selects (listas, campanhas, links, tags)",
              "Ocultar operadores irrelevantes",
              "Preview em tempo real do tamanho do segmento",
              "Salvar blocos favoritos",
              "Exportar lógica (JSON/YAML) p/ QA"
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">✓</Badge>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🗃️ 5. Esquema Mínimo de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Contato</h4>
            <div className="bg-muted p-4 rounded-md">
              <code className="text-sm">
                email, status, opt_in_at<br/>
                provider, domain, device, client<br/>
                total_opens, total_clicks, last_open_at, last_click_at<br/>
                opens_7d, opens_30d, opens_90d<br/>
                clicks_7d, clicks_30d, clicks_90d<br/>
                spam_complaints, hard_bounces, soft_bounces<br/>
                tags[], segments[]
              </code>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Histórico</h4>
            <div className="bg-muted p-4 rounded-md">
              <code className="text-sm">
                lists[]<br/>
                campaign_ids_sent[]<br/>
                campaign_ids_opened[]<br/>
                campaign_ids_clicked[]<br/>
                automations[]
              </code>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Avançado</h4>
            <div className="bg-muted p-4 rounded-md">
              <code className="text-sm">
                events[]<br/>
                engagement_score<br/>
                preferred_hour_band<br/>
                links_clicked_recent[]<br/>
                frequency_last_24h
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🏆 6. Benefícios</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li>• Cobre 100% dos cenários (ActiveCampaign, BMS, Drip)</li>
            <li>• Segmentos criados em segundos, sem expertise técnica</li>
            <li>• Interface limpa → menos suporte, mais receita</li>
          </ul>
          <div className="mt-4 p-4 bg-primary/10 rounded-md">
            <p className="font-semibold">Geração de receita:</p>
            <p className="text-sm">
              Segmentos precisos ⇒ mais opens/cliques ⇒ maior eRPM ⇒ mais lucro; menor saturação ⇒ melhor reputação IP.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📌 Exemplo monetizável</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-semibold">Segmento "Super quentes Cartão"</h4>
            <div className="mt-2 space-y-1">
              <p><strong>Inclui:</strong> abriu ≥ 5 (30 d), clicou ≥ 3 (10 d), evento=concluiu_simulacao_cartao</p>
              <p><strong>Exclui:</strong> tag cliente_ativo_cartao</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚩 Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            <li>1. Documentar no Notion → validar com PM/Tech Lead</li>
            <li>2. Wireframe no Lovable/Figma</li>
            <li>3. Fechar modelo de dados e iniciar POC</li>
          </ol>
          <div className="mt-4 p-4 bg-primary/10 rounded-md">
            <p className="font-semibold">Conclusão:</p>
            <p className="text-sm">
              O modelo atende 100% das necessidades dos publishers financeiros e pavimenta o caminho para máxima receita. 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}