import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Clock, Users, DollarSign, AlertTriangle, CheckCircle, Calendar, Zap, Settings, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useData } from "@/contexts/DataContext"
import { useGlobal } from "@/contexts/GlobalContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { FrequencyCapWidget } from "@/components/FrequencyCapWidget"
import { BestTimeWidget } from "@/components/BestTimeWidget"

const timeSlots = ['06h', '09h', '12h', '15h', '18h', '21h']

export default function Planner() {
  const [metaDiaria, setMetaDiaria] = useState([3000000])
  const [showOverlapModal, setShowOverlapModal] = useState(false)
  const [scheduledSegments, setScheduledSegments] = useState<any[]>([])
  const [selectedContentType, setSelectedContentType] = useState('newsletter')
  const { toast } = useToast()
  const { 
    audiences, 
    validateFrequencyCap, 
    getOverlapPercentage, 
    scheduleCampaign,
    getOptimalSendTime,
    getBestTimeInsights,
    contentTypes
  } = useData()
  const { state, toggleBestTime, setDefaultContentType } = useGlobal()
  const isMobile = useIsMobile()

  // Convert audiences to segments format with scheduling state - memoized
  const segments = useMemo(() => audiences.map(audience => ({
    id: audience.id,
    name: audience.name,
    size: audience.size,
    eRPM: audience.eRPM,
    health: audience.health,
    scheduled: scheduledSegments.some(s => s.id === audience.id),
    timeSlot: scheduledSegments.find(s => s.id === audience.id)?.timeSlot || null
  })), [audiences, scheduledSegments])

  const overlapData = useMemo(() => audiences.slice(0, 2).map((aud1, i) => {
    const aud2 = audiences[i + 1]
    return aud2 ? {
      segment1: aud1.name,
      segment2: aud2.name,
      overlap: getOverlapPercentage(aud1.id, aud2.id)
    } : null
  }).filter(Boolean), [audiences, getOverlapPercentage])

  const totalScheduled = useMemo(() => scheduledSegments.length, [scheduledSegments])
  const totalClicks = useMemo(() => scheduledSegments.reduce((sum, s) => {
    const segment = segments.find(seg => seg.id === s.id)
    return segment ? sum + (segment.size * segment.eRPM / 1000 * 0.02) : sum
  }, 0), [scheduledSegments, segments]) // Estimativa 2% CTR

  const handleDrop = useCallback((result: any) => {
    if (!result.destination) return

    const segmentId = result.draggableId
    const timeSlot = result.destination.droppableId
    const segment = segments.find(s => s.id === segmentId)

    if (!segment) return

    // Validate frequency cap
    if (!validateFrequencyCap(segmentId, timeSlot)) {
      toast({
        title: "Frequency Cap violado!",
        description: `Não é possível agendar para ${timeSlot} - limite de ${state.frequencyCapValue} por 24h`,
        variant: "destructive"
      })
      return
    }

    // Check for high overlap
    const existingSegments = scheduledSegments.filter(s => s.timeSlot === timeSlot)
    for (const existing of existingSegments) {
      const overlap = getOverlapPercentage(segmentId, existing.id)
      if (overlap > 30) {
        toast({
          title: "Alto overlap detectado!",
          description: `${overlap}% de overlap com ${existing.name}`,
          variant: "destructive"
        })
        return
      }
    }

    setScheduledSegments(prev => {
      const newSegment = { id: segmentId, timeSlot, scheduled: true }
      const existing = prev.find(s => s.id === segmentId)
      if (existing) {
        return prev.map(s => s.id === segmentId ? newSegment : s)
      }
      return [...prev, newSegment]
    })

    // Get optimal send time if Best Time is enabled
    let scheduleMessage = `${segment.name} agendado para ${timeSlot}`
    
    if (state.bestTimeEnabled) {
      const optimalTime = getOptimalSendTime(segmentId, selectedContentType)
      const insights = getBestTimeInsights(segmentId)
      
      if (insights.expectedLift > 0) {
        scheduleMessage += ` (Optimized: +${insights.expectedLift}% expected lift)`
      }
    }

    toast({
      title: "Segmento agendado!",
      description: scheduleMessage,
    })
  }, [segments, state.frequencyCapValue, state.bestTimeEnabled, selectedContentType, scheduledSegments, validateFrequencyCap, getOverlapPercentage, getOptimalSendTime, getBestTimeInsights, toast])

  const handleLaunchDay = useCallback(() => {
    const scheduledCount = scheduledSegments.length
    if (scheduledCount === 0) {
      toast({
        title: "Nenhum envio agendado",
        description: "Arraste pelo menos um segmento para um horário",
        variant: "destructive"
      })
      return
    }

    // Schedule campaigns
    scheduledSegments.forEach(segment => {
      const audience = audiences.find(a => a.id === segment.id)
      if (audience) {
        scheduleCampaign({
          name: `${audience.name} - ${segment.timeSlot}`,
          audienceId: audience.id,
          scheduledTime: segment.timeSlot,
          sent: 0,
          opened: 0,
          clicked: 0,
          revenue: 0,
          spamRate: 0
        })
      }
    })

    toast({
      title: "Agendado! 🚀",
      description: `${scheduledCount} envios programados para hoje`,
    })
  }, [scheduledSegments, audiences, scheduleCampaign, toast])

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

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Campaign Planner
                {state.bestTimeEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Best Time Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats Bar */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
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

              {/* Available Segments with Best Time Preview */}
              <div>
                <h3 className="font-semibold mb-4">Segmentos Disponíveis</h3>
                <DragDropContext onDragEnd={handleDrop}>
                  <Droppable droppableId="available-segments">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {segments.filter(s => !s.scheduled).slice(0, 20).map((segment, index) => (
                          <Draggable key={segment.id} draggableId={segment.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:shadow-md transition-shadow"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{segment.name}</span>
                                    <Badge variant={getHealthColor(segment.health) === 'success' ? 'default' : 
                                      getHealthColor(segment.health) === 'warning' ? 'secondary' : 'outline'} className="text-xs">
                                      {getHealthIcon(segment.health)}
                                      {segment.health}
                                    </Badge>
                                    {state.bestTimeEnabled && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Zap className="h-3 w-3 mr-1" />
                                        AI
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {segment.size.toLocaleString('pt-BR')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      R$ {segment.eRPM.toFixed(2)}
                                    </span>
                                     {state.bestTimeEnabled && useMemo(() => {
                                       const insights = getBestTimeInsights(segment.id)
                                       return insights.expectedLift > 0 && (
                                         <span className="flex items-center gap-1 text-success">
                                           <TrendingUp className="h-3 w-3" />
                                           +{insights.expectedLift}%
                                         </span>
                                       )
                                     }, [segment.id])}
                                  </div>
                                </div>
                                
                                 <div className="text-right">
                                   {state.bestTimeEnabled ? useMemo(() => {
                                     const optimalTime = getOptimalSendTime(segment.id, selectedContentType)
                                     const insights = getBestTimeInsights(segment.id)
                                     return (
                                       <>
                                         <div className="text-sm font-medium text-primary">
                                           {optimalTime.toLocaleTimeString('pt-BR', { 
                                             hour: '2-digit', 
                                             minute: '2-digit',
                                             hour12: false 
                                           })}
                                         </div>
                                         <div className="text-xs text-muted-foreground">
                                           {insights.confidence >= 0.7 ? 'High confidence' :
                                            insights.confidence >= 0.4 ? 'Medium confidence' :
                                            'Low confidence'}
                                         </div>
                                       </>
                                     )
                                   }, [segment.id, selectedContentType]) : (
                                     <>
                                       <div className="text-sm font-medium text-primary">
                                         09:30
                                       </div>
                                       <div className="text-xs text-muted-foreground">
                                         Default
                                       </div>
                                     </>
                                   )}
                                 </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Time Slots Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Grade de Horários</h3>
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
                </div>
                
                <DragDropContext onDragEnd={handleDrop}>
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
                              .map((scheduled) => {
                                const segment = segments.find(s => s.id === scheduled.id)
                                return segment ? (
                                  <div key={scheduled.id} className="bg-primary/10 border border-primary/20 rounded p-2 text-xs">
                                    <div className="font-medium">{segment.name}</div>
                                    <div className="text-muted-foreground">
                                      {segment.size.toLocaleString('pt-BR')} contatos
                                    </div>
                                  </div>
                                ) : null
                              })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </DragDropContext>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/3 space-y-4">
          {/* Best Time Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4" />
                Send-Time Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Enable Best Time</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically optimize send times for each audience
                  </p>
                </div>
                <Switch
                  checked={state.bestTimeEnabled}
                  onCheckedChange={toggleBestTime}
                />
              </div>
              
              {state.bestTimeEnabled && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Type</label>
                  <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <span>{type.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {type.urgencyLevel}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Influences timing strategy and urgency handling
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <FrequencyCapWidget />
          
          {/* Best Time Insights for selected segments */}
          {state.bestTimeEnabled && scheduledSegments.length > 0 && (
            <div className="space-y-4">
              {scheduledSegments.slice(0, 2).map(segmentId => (
                <BestTimeWidget 
                  key={segmentId} 
                  audienceId={segmentId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}