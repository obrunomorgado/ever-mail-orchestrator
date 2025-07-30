import { useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Clock } from "lucide-react"
import { useGlobal } from "@/contexts/GlobalContext"
import { useData } from "@/contexts/DataContext"
import { useToast } from "@/hooks/use-toast"

export function FrequencyCapWidget() {
  const { state } = useGlobal()
  const { campaigns } = useData()
  const { toast } = useToast()

  // Count recent campaigns (simulated frequency)
  const recentCampaigns = campaigns.filter(c => 
    c.status === 'scheduled' || c.status === 'sending'
  )
  
  const currentFrequency = recentCampaigns.length
  const isViolation = currentFrequency > state.frequencyCapValue
  const isWarning = currentFrequency >= state.frequencyCapValue * 0.8

  // Real-time violation alerts
  useEffect(() => {
    if (isViolation) {
      toast({
        title: "⚠️ Frequency Cap Violation",
        description: `Current frequency (${currentFrequency}) exceeds limit (${state.frequencyCapValue}). Consider reducing scheduled campaigns.`,
        variant: "destructive",
        duration: 8000,
      })
    } else if (isWarning) {
      toast({
        title: "⚡ Frequency Warning", 
        description: `Approaching frequency limit: ${currentFrequency}/${state.frequencyCapValue} emails per day`,
        variant: "default",
        duration: 5000,
      })
    }
  }, [isViolation, isWarning, currentFrequency, state.frequencyCapValue, toast])

  const getStatusColor = () => {
    if (isViolation) return 'text-destructive'
    if (isWarning) return 'text-warning'
    return 'text-success'
  }

  const getStatusIcon = () => {
    if (isViolation) return <AlertTriangle className="h-4 w-4" />
    if (isWarning) return <Clock className="h-4 w-4" />
    return <Shield className="h-4 w-4" />
  }

  const getStatusBadge = () => {
    if (isViolation) return <Badge className="destructive-badge">VIOLAÇÃO</Badge>
    if (isWarning) return <Badge className="warning-badge">ATENÇÃO</Badge>
    return <Badge className="success-badge">OK</Badge>
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
            <span className="text-sm font-medium">Frequency Cap</span>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Atual / Limite</span>
            <span className={`text-sm font-bold ${getStatusColor()}`}>
              {currentFrequency} / {state.frequencyCapValue}
            </span>
          </div>
          
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isViolation ? 'bg-destructive' : 
                isWarning ? 'bg-warning' : 'bg-success'
              }`}
              style={{ 
                width: `${Math.min((currentFrequency / state.frequencyCapValue) * 100, 100)}%` 
              }}
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            {isViolation ? (
              "Limite excedido - novos envios serão bloqueados"
            ) : isWarning ? (
              `${state.frequencyCapValue - currentFrequency} envios restantes`
            ) : (
              "Tudo ok - dentro do limite"
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}