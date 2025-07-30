import React from 'react'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Undo2, Redo2, Save, Settings } from "lucide-react"
import { useGlobal } from "@/contexts/GlobalContext"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AppHeader() {
  const { undo, redo, canUndo, canRedo, state, toggleAutoSave } = useGlobal()

  return (
    <header className="h-16 flex items-center justify-between border-b border-border px-4 bg-card/50">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                  className="gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Desfazer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ctrl+Z</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                  className="gap-2"
                >
                  <Redo2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Refazer</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ctrl+Y / Ctrl+Shift+Z</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Auto-save indicator */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAutoSave}
            className="gap-2"
          >
            <Save className={`h-4 w-4 ${state.autoSaveEnabled ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="hidden sm:inline">Auto-save</span>
          </Button>
          <Badge 
            variant={state.autoSaveEnabled ? 'default' : 'secondary'}
            className={state.autoSaveEnabled ? 'bg-success/10 text-success' : ''}
          >
            {state.autoSaveEnabled ? 'ON' : 'OFF'}
          </Badge>
        </div>

        {/* Frequency Cap Display */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Frequency Cap:</span>
          <Badge 
            variant={state.frequencyCapValue >= 8 ? 'destructive' : 
                    state.frequencyCapValue >= 6 ? 'secondary' : 'default'}
            className={state.frequencyCapValue >= 6 && state.frequencyCapValue < 8 ? 'bg-warning/10 text-warning' :
                      state.frequencyCapValue < 6 && state.frequencyCapValue > 0 ? 'bg-success/10 text-success' : ''}
          >
            {state.frequencyCapValue === 0 ? 'Ilimitado' : `${state.frequencyCapValue}/24h`}
          </Badge>
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}