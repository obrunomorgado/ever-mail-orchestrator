import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuardrailsBanner } from "@/components/GuardrailsBanner";
import { heatMapData, guardrailsData } from "@/mocks/demoData";
import { TrendingUp } from "lucide-react";

const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export function HeatMapPanel() {
  const [hoveredCell, setHoveredCell] = useState<{ hour: number; day: number; data: any } | null>(null);

  const getColorIntensity = (erpm: number) => {
    const maxErpm = 0.5;
    const intensity = Math.min(erpm / maxErpm, 1);
    return `rgba(59, 130, 246, ${intensity})`;
  };

  const formatTime = (hour: number) => {
    return hour.toString().padStart(2, '0') + ':00';
  };

  const getCellData = (hour: number, day: number) => {
    return heatMapData.find(d => d.hour === hour && d.day === day);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Heat Map - Otimização por Horário</h1>
          <p className="text-muted-foreground">
            Matriz 24×7 mostrando performance por dia da semana e horário
          </p>
        </div>
      </div>

      <GuardrailsBanner 
        spamRate={guardrailsData.spamRate}
        bounceRate={guardrailsData.bounceRate}
        unsubscribeRate={guardrailsData.unsubscribeRate}
      />

      <Card>
        <CardHeader>
          <CardTitle>Receita por Horário (eRPM)</CardTitle>
          <CardDescription>
            Cores mais intensas indicam maior receita por mil emails enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="grid grid-cols-8 gap-1 text-sm">
              {/* Header row */}
              <div></div>
              {days.map((day, idx) => (
                <div key={day} className="text-center font-medium p-2">
                  {day}
                </div>
              ))}
              
              {/* Hour rows */}
              {hours.map((hour) => (
                <div key={hour} className="contents">
                  <div className="text-right font-medium p-2 text-muted-foreground">
                    {formatTime(hour)}
                  </div>
                  {days.map((_, dayIdx) => {
                    const cellData = getCellData(hour, dayIdx);
                    return (
                      <div
                        key={`${hour}-${dayIdx}`}
                        className="aspect-square relative cursor-pointer border border-border rounded transition-all hover:scale-110 hover:z-10 hover:shadow-lg"
                        style={{
                          backgroundColor: cellData ? getColorIntensity(cellData.erpm) : '#f3f4f6'
                        }}
                        onMouseEnter={() => cellData && setHoveredCell({ hour, day: dayIdx, data: cellData })}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Tooltip */}
            {hoveredCell && (
              <div className="absolute z-20 bg-popover border border-border rounded-lg p-3 shadow-lg pointer-events-none"
                   style={{
                     left: '50%',
                     top: '50%',
                     transform: 'translate(-50%, -50%)'
                   }}>
                <div className="text-sm font-medium">
                  {days[hoveredCell.day]} às {formatTime(hoveredCell.hour)}
                </div>
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                  <div>eRPM: R$ {hoveredCell.data.erpm.toFixed(2)}</div>
                  <div>Taxa de Abertura: {(hoveredCell.data.openRate * 100).toFixed(1)}%</div>
                  <div>Taxa de Clique: {(hoveredCell.data.clickRate * 100).toFixed(1)}%</div>
                  <div>Volume: {hoveredCell.data.volume.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm">
            <span>Baixa Receita</span>
            <div className="flex gap-1">
              {[0.1, 0.2, 0.3, 0.4, 0.5].map((value) => (
                <div
                  key={value}
                  className="w-4 h-4 border border-border rounded"
                  style={{ backgroundColor: getColorIntensity(value) }}
                />
              ))}
            </div>
            <span>Alta Receita</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Melhor Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">09:00</div>
            <p className="text-xs text-muted-foreground">Quartas-feiras</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Maior eRPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0.42</div>
            <p className="text-xs text-muted-foreground">Pico semanal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Volume Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(heatMapData.reduce((sum, d) => sum + d.volume, 0)).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}