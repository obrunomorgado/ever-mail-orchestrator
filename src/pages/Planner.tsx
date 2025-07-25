import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Clock, Users, DollarSign, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dados demo
const timeSlots = ['06h', '09h', '12h', '15h', '18h', '21h']
const segments = [
  {
    id: 'vip-cards',
    name: 'Cartões VIP',
    size: 120000,
    eRPM: 150.0,
    health: 'excellent',
    scheduled: false,
    timeSlot: null
  },
  {
    id: 'hot-eRPM',
    name: 'Hot eRPM',
    size: 27000,
    eRPM: 180.0,
    health: 'good',
    scheduled: false,
    timeSlot: null
  },
  {
    id: 'opened-3',
    name: 'Opened_3',
    size: 45000,
    eRPM: 95.0,
    health: 'warning',
    scheduled: false,
    timeSlot: null
  },
  {
    id: 'clicked-1',
    name: 'Clicked_1',
    size: 38000,
    eRPM: 210.0,
    health: 'excellent',
    scheduled: false,
    timeSlot: null
  }
]

const overlapData = [
  { segment1: 'Cartões VIP', segment2: 'Hot eRPM', overlap: 45 },
  { segment1: 'Opened_3', segment2: 'Clicked_1', overlap: 25 },
]

export default function Planner() {
  const [scheduledSegments, setScheduledSegments] = useState(segments)
  const [metaDiaria, setMetaDiaria] = useState([3000000])
  const [showOverlapModal, setShowOverlapModal] = useState(false)
  const { toast } = useToast()

  const totalScheduled = scheduledSegments.filter(s => s.scheduled).length
  const totalClicks = scheduledSegments
    .filter(s => s.scheduled)
    .reduce((sum, s) => sum + (s.size * s.eRPM / 1000 * 0.02), 0) // Estimativa 2% CTR

  const handleDrop = (result: any) => {
    if (!result.destination) return

    const segmentId = result.draggableId
    const timeSlot = result.destination.droppableId

    setScheduledSegments(prev => prev.map(segment => 
      segment.id === segmentId 
        ? { ...segment, scheduled: true, timeSlot }
        : segment
    ))

    toast({
      title: "Segmento agendado!",
      description: `${segments.find(s => s.id === segmentId)?.name} agendado para ${timeSlot}`,
    })
  }

  const handleLaunchDay = () => {
    const scheduledCount = scheduledSegments.filter(s => s.scheduled).length
    if (scheduledCount === 0) {
      toast({
        title: "Nenhum envio agendado",
        description: "Arraste pelo menos um segmento para um horário",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Agendado! 🚀",
      description: `${scheduledCount} envios programados para hoje`,
    })
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'success'
      case 'good': return 'info'
      case 'warning': return 'warning'
      default: return 'muted'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Planner</h1>
          <p className="text-muted-foreground">Grade de envios - Planeje seu dia em menos de 20 minutos</p>
        </div>
        <Button onClick={handleLaunchDay} size="lg" className="bg-primary hover:bg-primary/90">
          <Calendar className="mr-2 h-4 w-4" />
          Launch Day
        </Button>
      </div>

      {/* Stats Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Envios:</span>
                <Badge variant="outline">{totalScheduled}/20</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Cliques previstos:</span>
                <Badge className="bg-success/10 text-success">{Math.round(totalClicks).toLocaleString('pt-BR')}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Meta diária:</span>
              <div className="w-48">
                <Slider
                  value={metaDiaria}
                  onValueChange={setMetaDiaria}
                  max={5000000}
                  min={1000000}
                  step={100000}
                  className="w-full"
                />
              </div>
              <Badge variant="outline">{metaDiaria[0].toLocaleString('pt-BR')}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drag and Drop Grid */}
      <DragDropContext onDragEnd={handleDrop}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Segmentos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="available-segments">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {scheduledSegments.filter(s => !s.scheduled).map((segment, index) => (
                      <Draggable key={segment.id} draggableId={segment.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="segment-card"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-foreground">{segment.name}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    {segment.size.toLocaleString('pt-BR')}
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-success">
                                    <DollarSign className="h-3 w-3" />
                                    R$ {segment.eRPM.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${getHealthColor(segment.health) === 'success' ? 'success-badge' : 
                                  getHealthColor(segment.health) === 'warning' ? 'warning-badge' : 'info-badge'}`}>
                                  {getHealthIcon(segment.health)}
                                  {segment.health}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Time Slots Grid */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Grade de Horários</CardTitle>
              <Dialog open={showOverlapModal} onOpenChange={setShowOverlapModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Overlap Checker
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Matriz de Overlap</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {overlapData.map((overlap, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{overlap.segment1} × {overlap.segment2}</p>
                        </div>
                        <Badge className={overlap.overlap > 30 ? 'warning-badge' : 'success-badge'}>
                          {overlap.overlap}%
                        </Badge>
                      </div>
                    ))}
                    <Button className="w-full" onClick={() => setShowOverlapModal(false)}>
                      Resolve Overlaps
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <Droppable key={slot} droppableId={slot}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`min-h-24 p-3 border-2 border-dashed rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{slot}</span>
                        </div>
                        {scheduledSegments
                          .filter(s => s.timeSlot === slot)
                          .map((segment, index) => (
                            <div key={segment.id} className="bg-primary/10 border border-primary/20 rounded p-2 text-xs">
                              <div className="font-medium">{segment.name}</div>
                              <div className="text-muted-foreground">
                                {segment.size.toLocaleString('pt-BR')} contatos
                              </div>
                            </div>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DragDropContext>
    </div>
  )
}