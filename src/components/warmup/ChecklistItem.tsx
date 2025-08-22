import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ChecklistItemProps {
  label: string;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function ChecklistItem({ label, defaultChecked = false, onCheckedChange }: ChecklistItemProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleCheckedChange = (checkedValue: boolean) => {
    setChecked(checkedValue);
    onCheckedChange?.(checkedValue);
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <Checkbox 
        id={label}
        checked={checked}
        onCheckedChange={handleCheckedChange}
      />
      <label 
        htmlFor={label}
        className={`text-sm cursor-pointer flex-1 ${
          checked ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {label}
      </label>
    </div>
  );
}