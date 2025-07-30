import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity, Download, TrendingUp, AlertTriangle, Filter } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Dados demo para o heat-map
const segments = ['Cartões VIP', 'Hot eRPM', 'Opened_3', 'Clicked_1', 'Newsletter', 'Inativos']
const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const heatMapData = [
  { segment: 'Cartões VIP', monday: { eRPM: 180, spam: 0.03, revenue: 2100 }, tuesday: { eRPM: 165, spam: 0.05, revenue: 1950 }, wednesday: { eRPM: 190, spam: 0.02, revenue: 2200 }, thursday: { eRPM: 175, spam: 0.04, revenue: 2050 }, friday: { eRPM: 195, spam: 0.03, revenue: 2300 }, saturday: { eRPM: 160, spam: 0.06, revenue: 1850 }, sunday: { eRPM: 155, spam: 0.07, revenue: 1750 } },
  { segment: 'Hot eRPM', monday: { eRPM: 210, spam: 0.02, revenue: 1680 }, tuesday: { eRPM: 205, spam: 0.03, revenue: 1640 }, wednesday: { eRPM: 220, spam: 0.02, revenue: 1760 }, thursday: { eRPM: 215, spam: 0.03, revenue: 1720 }, friday: { eRPM: 225, spam: 0.02, revenue: 1800 }, saturday: { eRPM: 190, spam: 0.05, revenue: 1520 }, sunday: { eRPM: 185, spam: 0.06, revenue: 1480 } },
  { segment: 'Opened_3', monday: { eRPM: 95, spam: 0.08, revenue: 855 }, tuesday: { eRPM: 88, spam: 0.09, revenue: 792 }, wednesday: { eRPM: 102, spam: 0.07, revenue: 918 }, thursday: { eRPM: 98, spam: 0.08, revenue: 882 }, friday: { eRPM: 105, spam: 0.06, revenue: 945 }, saturday: { eRPM: 82, spam: 0.12, revenue: 738 }, sunday: { eRPM: 78, spam: 0.14, revenue: 702 } },
  { segment: 'Clicked_1', monday: { eRPM: 145, spam: 0.04, revenue: 1305 }, tuesday: { eRPM: 140, spam: 0.05, revenue: 1260 }, wednesday: { eRPM: 152, spam: 0.03, revenue: 1368 }, thursday: { eRPM: 148, spam: 0.04, revenue: 1332 }, friday: { eRPM: 155, spam: 0.03, revenue: 1395 }, saturday: { eRPM: 130, spam: 0.07, revenue: 1170 }, sunday: { eRPM: 125, spam: 0.08, revenue: 1125 } },
  { segment: 'Newsletter', monday: { eRPM: 65, spam: 0.15, revenue: 1300 }, tuesday: { eRPM: 62, spam: 0.16, revenue: 1240 }, wednesday: { eRPM: 68, spam: 0.14, revenue: 1360 }, thursday: { eRPM: 66, spam: 0.15, revenue: 1320 }, friday: { eRPM: 70, spam: 0.13, revenue: 1400 }, saturday: { eRPM: 58, spam: 0.18, revenue: 1160 }, sunday: { eRPM: 55, spam: 0.20, revenue: 1100 } },
  { segment: 'Inativos', monday: { eRPM: 25, spam: 0.25, revenue: 500 }, tuesday: { eRPM: 22, spam: 0.28, revenue: 440 }, wednesday: { eRPM: 28, spam: 0.22, revenue: 560 }, thursday: { eRPM: 26, spam: 0.24, revenue: 520 }, friday: { eRPM: 30, spam: 0.20, revenue: 600 }, saturday: { eRPM: 20, spam: 0.32, revenue: 400 }, sunday: { eRPM: 18, spam: 0.35, revenue: 360 } }
]

const templatePerformance = {
  'Welcome v1': { OR: 42.5, CTR: 3.2, eRPM: 89, spam: 0.04, sends: 125000 },
  'Welcome v2': { OR: 38.1, CTR: 2.8, eRPM: 76, spam: 0.06, sends: 98000 },
  'Promo Flash': { OR: 35.6, CTR: 5.1, eRPM: 156, spam: 0.09, sends: 87000 },
  'Newsletter': { OR: 28.3, CTR: 1.9, eRPM: 65, spam: 0.15, sends: 450000 },
  'VIP Exclusive': { OR: 48.7, CTR: 4.8, eRPM: 210, spam: 0.02, sends: 45000 }
}

export default function Reports() {
  const [selectedCell, setSelectedCell] = useState<any>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const getCellColor = (eRPM: number, spam: number) => {
    if (spam > 0.15) return 'bg-destructive/80 text-destructive-foreground' // Vermelho para spam alto
    if (eRPM > 150) return 'bg-success/80 text-success-foreground' // Verde para eRPM alto
    if (eRPM > 100) return 'bg-warning/60 text-warning-foreground' // Amarelo para eRPM médio
    return 'bg-muted/60 text-muted-foreground' // Neutro para eRPM baixo
  }

  const handleCellClick = (segment: string, day: string, data: any) => {
    setSelectedCell({ segment, day, ...data })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Heat-Map de performance e KPIs detalhados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Heat-Map Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Heat-Map: Segmentos × Dia da Semana
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/80 rounded"></div>
              <span>eRPM Alto (&gt;R$150)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning/60 rounded"></div>
              <span>eRPM Médio (R$100-150)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive/80 rounded"></div>
              <span>Spam Alto (&gt;0.15%)</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium">Segmento</th>
                  {weekDays.map(day => (
                    <th key={day} className="text-center p-2 font-medium min-w-24">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatMapData.map((row) => (
                  <tr key={row.segment}>
                    <td className="p-2 font-medium">{row.segment}</td>
                    {Object.entries(row).slice(1).map(([day, data]: [string, any]) => (
                      <td key={day} className="p-1">
                        <div
                          className={`p-2 rounded cursor-pointer transition-all hover:scale-105 ${getCellColor(data.eRPM, data.spam)}`}
                          onClick={() => handleCellClick(row.segment, day, data)}
                        >
                          <div className="text-center">
                            <div className="text-sm font-bold">R${data.eRPM}</div>
                            <div className="text-xs opacity-90">{data.spam}%</div>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes da Célula */}
      {selectedCell && (
        <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCell.segment} - {selectedCell.day}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-success/10 rounded">
                  <div className="text-2xl font-bold text-success">R$ {selectedCell.eRPM}</div>
                  <div className="text-sm text-muted-foreground">eRPM</div>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded">
                  <div className="text-2xl font-bold text-destructive">{selectedCell.spam}%</div>
                  <div className="text-sm text-muted-foreground">Spam Rate</div>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded">
                  <div className="text-2xl font-bold text-warning">R$ {selectedCell.revenue}</div>
                  <div className="text-sm text-muted-foreground">Receita</div>
                </div>
              </div>
              <Button 
                onClick={() => setShowTemplateModal(true)} 
                className="w-full"
              >
                Ver Template Performance
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Template Performance */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Template Performance</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>OR (%)</TableHead>
                <TableHead>CTR (%)</TableHead>
                <TableHead>eRPM (R$)</TableHead>
                <TableHead>Spam (%)</TableHead>
                <TableHead>Envios</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(templatePerformance).map(([template, metrics]) => (
                <TableRow key={template}>
                  <TableCell className="font-medium">{template}</TableCell>
                  <TableCell>{metrics.OR}%</TableCell>
                  <TableCell>{metrics.CTR}%</TableCell>
                  <TableCell className="font-medium">R$ {metrics.eRPM}</TableCell>
                  <TableCell>
                    <Badge className={metrics.spam > 0.1 ? 'warning-badge' : 'success-badge'}>
                      {metrics.spam}%
                    </Badge>
                  </TableCell>
                  <TableCell>{metrics.sends.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge className={metrics.eRPM > 100 ? 'success-badge' : 'info-badge'}>
                      {metrics.eRPM > 100 ? 'Ótimo' : 'Bom'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Cards de KPIs Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Melhor Segmento</p>
                <p className="font-semibold">Hot eRPM</p>
                <p className="text-xs text-success">R$ 210 eRPM médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Atenção</p>
                <p className="font-semibold">Fins de Semana</p>
                <p className="text-xs text-warning">Performance 15% menor</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Melhor Dia</p>
                <p className="font-semibold">Sexta-feira</p>
                <p className="text-xs text-info">eRPM 8% acima da média</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Evitar</p>
                <p className="font-semibold">Inativos Dom.</p>
                <p className="text-xs text-destructive">35% spam rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}