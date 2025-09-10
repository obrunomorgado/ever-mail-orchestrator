import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MonthlyMetrics } from '@/types/scheduler';
import { TrendingUp, Calendar, DollarSign, Users, CheckCircle, Clock, FileText } from 'lucide-react';

interface TacticalCalendarMetricsProps {
  metrics: MonthlyMetrics;
}

export function TacticalCalendarMetrics({ metrics }: TacticalCalendarMetricsProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {/* Total Events */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{metrics.totalEvents}</p>
              <p className="text-xs text-muted-foreground">Eventos</p>
            </div>
          </div>

          {/* Total Campaigns */}
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-info" />
            <div>
              <p className="text-2xl font-bold text-foreground">{metrics.totalCampaigns}</p>
              <p className="text-xs text-muted-foreground">Campanhas</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {(metrics.totalRevenue / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Receita</p>
            </div>
          </div>

          {/* Total Contacts */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {(metrics.totalContacts / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Contatos</p>
            </div>
          </div>

          {/* Active Events */}
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            <div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {metrics.activeEvents} Ativos
              </Badge>
            </div>
          </div>

          {/* Completed Events */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-info" />
            <div>
              <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                {metrics.completedEvents} Concluídos
              </Badge>
            </div>
          </div>

          {/* Draft Events */}
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                {metrics.draftEvents} Rascunhos
              </Badge>
            </div>
          </div>
        </div>

        {/* Weekly Distribution */}
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-2">Distribuição Semanal</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.weeklyDistribution.map((week) => (
              <div key={week.week} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground">Semana {week.week}</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{week.events} eventos</span>
                  <span className="text-success font-medium">
                    R$ {(week.revenue / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}