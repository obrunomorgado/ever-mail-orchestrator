import { AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface GuardrailsBannerProps {
  spamRate: number;
  bounceRate: number;
  unsubscribeRate?: number;
  className?: string;
}

export function GuardrailsBanner({ 
  spamRate, 
  bounceRate, 
  unsubscribeRate,
  className 
}: GuardrailsBannerProps) {
  const spamThreshold = 0.05;
  const bounceThreshold = 0.03;
  const unsubThreshold = 0.02;

  const isSpamHigh = spamRate > spamThreshold;
  const isBounceHigh = bounceRate > bounceThreshold;
  const isUnsubHigh = unsubscribeRate ? unsubscribeRate > unsubThreshold : false;
  
  const hasIssues = isSpamHigh || isBounceHigh || isUnsubHigh;

  return (
    <Alert className={`${hasIssues ? 'border-destructive' : 'border-green-500'} ${className}`}>
      {hasIssues ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      <AlertDescription className="flex items-center gap-4">
        <span className="font-medium">
          {hasIssues ? 'Atenção: Guardrails ativados' : 'Status: Todas as métricas OK'}
        </span>
        <div className="flex gap-2">
          <Badge variant={isSpamHigh ? 'destructive' : 'secondary'}>
            Spam: {(spamRate * 100).toFixed(1)}%
          </Badge>
          <Badge variant={isBounceHigh ? 'destructive' : 'secondary'}>
            Bounce: {(bounceRate * 100).toFixed(1)}%
          </Badge>
          {unsubscribeRate && (
            <Badge variant={isUnsubHigh ? 'destructive' : 'secondary'}>
              Unsub: {(unsubscribeRate * 100).toFixed(1)}%
            </Badge>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}