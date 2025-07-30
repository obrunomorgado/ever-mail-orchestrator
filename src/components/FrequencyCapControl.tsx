import React from 'react'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock } from 'lucide-react'
import { useGlobal } from '@/contexts/GlobalContext'

export function FrequencyCapControl() {
  const { state, setFrequencyCap } = useGlobal()
  
  const getCapColor = (value: number) => {
    if (value >= 8) return 'text-destructive'
    if (value >= 6) return 'text-warning'
    return 'text-success'
  }
  
  const getCapBadge = (value: number) => {
    if (value >= 8) return { text: 'Risco Alto', variant: 'destructive' as const }
    if (value >= 6) return { text: 'Atenção', variant: 'warning' as const }
    if (value === 0) return { text: 'Desabilitado', variant: 'secondary' as const }
    return { text: 'Seguro', variant: 'success' as const }
  }

  const badge = getCapBadge(state.frequencyCapValue)

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Frequency Cap
          <Badge className={badge.variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 
                          badge.variant === 'warning' ? 'bg-warning/10 text-warning' :
                          badge.variant === 'success' ? 'bg-success/10 text-success' : 
                          'bg-secondary text-secondary-foreground'}>
            {badge.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Envios por 24h</span>
            <span className={`text-lg font-bold ${getCapColor(state.frequencyCapValue)}`}>
              {state.frequencyCapValue === 0 ? 'Ilimitado' : state.frequencyCapValue}
            </span>
          </div>
          
          <Slider
            value={[state.frequencyCapValue]}
            onValueChange={(value) => setFrequencyCap(value[0])}
            max={10}
            min={0}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
        
        {state.frequencyCapValue >= 8 && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
            <AlertTriangle className="h-3 w-3" />
            <span>Alto risco de spam. Recomendado ≤ 6 envios/dia</span>
          </div>
        )}
        
        {state.frequencyCapValue === 0 && (
          <div className="flex items-center gap-2 p-2 bg-warning/10 rounded text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            <span>Frequency Cap desabilitado. Monitore spam rates.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}