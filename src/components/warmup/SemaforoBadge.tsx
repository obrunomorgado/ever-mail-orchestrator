import { cn } from "@/lib/utils";

interface SemaforoBadgeProps {
  state: "verde" | "amarelo" | "vermelho";
  className?: string;
}

export function SemaforoBadge({ state, className }: SemaforoBadgeProps) {
  const stateConfig = {
    verde: {
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/20",
      label: "Saudável"
    },
    amarelo: {
      bg: "bg-warning/10", 
      text: "text-warning",
      border: "border-warning/20",
      label: "Atenção"
    },
    vermelho: {
      bg: "bg-destructive/10",
      text: "text-destructive", 
      border: "border-destructive/20",
      label: "Crítico"
    }
  };

  const config = stateConfig[state];

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border",
      config.bg,
      config.text,
      config.border,
      className
    )}>
      <div className={cn("w-2 h-2 rounded-full", config.text.replace("text-", "bg-"))} />
      {config.label}
    </div>
  );
}