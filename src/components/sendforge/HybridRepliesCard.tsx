import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { EngagementMetrics, ReplyExample } from "@/types/sendforge";
import { MessageSquare, Bot, User, Crown, Star, Clock } from "lucide-react";

interface HybridRepliesCardProps {
  engagement: EngagementMetrics;
  replyExamples: ReplyExample[];
}

export function HybridRepliesCard({ engagement, replyExamples }: HybridRepliesCardProps) {
  const pieData = [
    { name: 'IA', value: engagement.replies.ai, color: 'hsl(var(--primary))' },
    { name: 'Humano', value: engagement.replies.human, color: 'hsl(var(--accent))' }
  ];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEngagementColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="kpi-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Replies Híbridos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value, 'Replies']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div className="text-2xl font-bold">{engagement.replies.total}</div>
                  <div className="text-xs text-muted-foreground">total</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="font-medium">IA</span>
                </div>
                <div className="text-xl font-bold text-primary">{engagement.replies.aiPercentage}%</div>
                <div className="text-sm text-muted-foreground">{engagement.replies.ai} replies</div>
              </div>
              <div className="text-center p-3 border border-accent/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <User className="h-4 w-4 text-accent" />
                  <span className="font-medium">Humano</span>
                </div>
                <div className="text-xl font-bold text-accent-foreground">{engagement.replies.humanPercentage}%</div>
                <div className="text-sm text-muted-foreground">{engagement.replies.human} replies</div>
              </div>
            </div>
          </div>

          {/* Premium Upsell */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Concierge Humano Premium</div>
                <div className="text-sm text-muted-foreground">
                  Respostas humanas reais para maior autenticidade
                </div>
              </div>
            </div>
            <Button className="w-full gap-2">
              <Crown className="h-4 w-4" />
              Ativar Add-on Premium
            </Button>
          </div>

          <Separator />

          {/* Reply Examples Timeline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Exemplos Recentes</span>
            </div>
            
            <div className="space-y-3">
              {replyExamples.slice(0, 3).map((reply) => (
                <div key={reply.id} className="p-3 border border-border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {reply.type === 'ai' ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-accent" />
                      )}
                      <Badge variant={reply.type === 'ai' ? 'default' : 'secondary'} className="text-xs">
                        {reply.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className={`h-3 w-3 ${getEngagementColor(reply.engagement)}`} />
                        <span className={`text-xs font-medium ${getEngagementColor(reply.engagement)}`}>
                          {reply.engagement.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(reply.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Re: {reply.originalSubject}
                    </div>
                    <div className="text-sm">{reply.reply}</div>
                    <div className="text-xs text-muted-foreground">
                      {reply.domain}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}