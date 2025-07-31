import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BackupToggleProps {
  onToggle?: (enabled: boolean) => void;
  defaultEnabled?: boolean;
}

export function BackupToggle({ onToggle, defaultEnabled = false }: BackupToggleProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    onToggle?.(checked);
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="backup-toggle"
        checked={enabled}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="backup-toggle" className="text-sm">
        Usar template reserva se envio bloquear
      </Label>
    </div>
  );
}