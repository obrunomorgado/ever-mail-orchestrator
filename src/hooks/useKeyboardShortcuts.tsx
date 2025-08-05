import { useEffect, useCallback } from 'react';
import { usePlanner } from '@/contexts/PlannerContext';

interface KeyboardShortcutsProps {
  onAddCampaign?: () => void;
  onDuplicateSelected?: () => void;
  onRemoveSelected?: () => void;
}

export function useKeyboardShortcuts({ 
  onAddCampaign, 
  onDuplicateSelected, 
  onRemoveSelected 
}: KeyboardShortcutsProps = {}) {
  const { undo, redo } = usePlanner();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Prevent shortcuts when typing in inputs
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    // Global shortcuts
    if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      undo();
      console.log('[KeyboardShortcuts] Undo triggered');
      return;
    }
    
    if ((event.metaKey || event.ctrlKey) && (event.shiftKey && event.key === 'z' || event.key === 'y')) {
      event.preventDefault();
      redo();
      console.log('[KeyboardShortcuts] Redo triggered');
      return;
    }

    // App-specific shortcuts (only when no modifiers)
    if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case 'a':
          event.preventDefault();
          onAddCampaign?.();
          console.log('[KeyboardShortcuts] Add campaign triggered');
          break;
        
        case 'd':
          event.preventDefault();
          onDuplicateSelected?.();
          console.log('[KeyboardShortcuts] Duplicate triggered');
          break;
        
        case 'delete':
        case 'backspace':
          if (event.key === 'Delete') { // Only Delete key, not Backspace
            event.preventDefault();
            onRemoveSelected?.();
            console.log('[KeyboardShortcuts] Remove triggered');
          }
          break;
      }
    }
  }, [undo, redo, onAddCampaign, onDuplicateSelected, onRemoveSelected]);

  useEffect(() => {
    console.log('[KeyboardShortcuts] Registering keyboard shortcuts');
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      console.log('[KeyboardShortcuts] Unregistering keyboard shortcuts');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: {
      'Ctrl+Z / Cmd+Z': 'Undo',
      'Ctrl+Y / Cmd+Shift+Z': 'Redo',
      'A': 'Add Campaign',
      'D': 'Duplicate Selected',
      'Delete': 'Remove Selected'
    }
  };
}