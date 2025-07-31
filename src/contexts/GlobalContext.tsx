import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface Action {
  type: string
  payload: any
  timestamp: number
  description: string
}

interface GlobalState {
  history: Action[]
  currentIndex: number
  frequencyCapValue: number
  autoSaveEnabled: boolean
  bestTimeEnabled: boolean
  defaultContentType: string
}

interface GlobalContextType {
  state: GlobalState
  dispatch: (action: Omit<Action, 'timestamp'>) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  setFrequencyCap: (value: number) => void
  toggleAutoSave: () => void
  toggleBestTime: () => void
  setDefaultContentType: (contentType: string) => void
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

const initialState: GlobalState = {
  history: [],
  currentIndex: -1,
  frequencyCapValue: 5,
  autoSaveEnabled: true,
  bestTimeEnabled: true,
  defaultContentType: 'newsletter',
}

function globalReducer(state: GlobalState, action: Action): GlobalState {
  switch (action.type) {
    case 'ADD_ACTION':
      // Remove any future actions if we're not at the end
      const newHistory = state.history.slice(0, state.currentIndex + 1)
      newHistory.push(action)
      
      // Keep only last 50 actions for performance
      const trimmedHistory = newHistory.slice(-50)
      
      return {
        ...state,
        history: trimmedHistory,
        currentIndex: trimmedHistory.length - 1,
      }
    
    case 'UNDO':
      return {
        ...state,
        currentIndex: Math.max(-1, state.currentIndex - 1),
      }
    
    case 'REDO':
      return {
        ...state,
        currentIndex: Math.min(state.history.length - 1, state.currentIndex + 1),
      }
    
    case 'SET_FREQUENCY_CAP':
      return {
        ...state,
        frequencyCapValue: action.payload,
      }
    
    case 'TOGGLE_AUTO_SAVE':
      return {
        ...state,
        autoSaveEnabled: !state.autoSaveEnabled,
      }
    
    case 'TOGGLE_BEST_TIME':
      return {
        ...state,
        bestTimeEnabled: !state.bestTimeEnabled,
      }
    
    case 'SET_DEFAULT_CONTENT_TYPE':
      return {
        ...state,
        defaultContentType: action.payload.contentType,
      }
    
    default:
      return state
  }
}

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState)
  const { toast } = useToast()

  const addAction = (action: Omit<Action, 'timestamp'>) => {
    const actionWithTimestamp: Action = {
      ...action,
      timestamp: Date.now(),
    }
    dispatch({ ...actionWithTimestamp, type: 'ADD_ACTION', payload: actionWithTimestamp })
  }

  const undo = () => {
    if (state.currentIndex >= 0) {
      dispatch({ type: 'UNDO', payload: null, timestamp: Date.now(), description: 'Undo' })
      const action = state.history[state.currentIndex]
      toast({
        title: "Ação desfeita",
        description: action.description,
        duration: 2000,
      })
    }
  }

  const redo = () => {
    if (state.currentIndex < state.history.length - 1) {
      dispatch({ type: 'REDO', payload: null, timestamp: Date.now(), description: 'Redo' })
      const action = state.history[state.currentIndex + 1]
      toast({
        title: "Ação refeita",
        description: action.description,
        duration: 2000,
      })
    }
  }

  const setFrequencyCap = (value: number) => {
    if (value < 0 || value > 10) {
      toast({
        title: "Frequency Cap inválido",
        description: "O valor deve estar entre 0 e 10 envios por 24h",
        variant: "destructive",
      })
      return
    }
    
    dispatch({ type: 'SET_FREQUENCY_CAP', payload: value, timestamp: Date.now(), description: `Frequency Cap alterado para ${value}` })
    addAction({
      type: 'FREQUENCY_CAP_CHANGED',
      payload: { oldValue: state.frequencyCapValue, newValue: value },
      description: `Frequency Cap alterado para ${value}`,
    })
  }

  const toggleAutoSave = () => {
    dispatch({ type: 'TOGGLE_AUTO_SAVE', payload: null, timestamp: Date.now(), description: 'Auto-save toggled' })
    addAction({
      type: 'AUTO_SAVE_TOGGLED',
      payload: { enabled: !state.autoSaveEnabled },
      description: `Auto-save ${!state.autoSaveEnabled ? 'ativado' : 'desativado'}`,
    })
  }

  const toggleBestTime = () => {
    dispatch({ type: 'TOGGLE_BEST_TIME', payload: null, timestamp: Date.now(), description: 'Best Time toggled' })
    addAction({
      type: state.bestTimeEnabled ? 'DISABLE_BEST_TIME' : 'ENABLE_BEST_TIME',
      payload: {},
      description: `${state.bestTimeEnabled ? 'Disabled' : 'Enabled'} Send-Time Optimization`
    })
  }

  const setDefaultContentType = (contentType: string) => {
    dispatch({ type: 'SET_DEFAULT_CONTENT_TYPE', payload: { contentType }, timestamp: Date.now(), description: `Content type changed to ${contentType}` })
    addAction({
      type: 'SET_CONTENT_TYPE',
      payload: { contentType },
      description: `Changed default content type to ${contentType}`
    })
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if (((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Z') || 
                 ((event.ctrlKey || event.metaKey) && event.key === 'y')) {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.currentIndex])

  // Auto-save functionality
  useEffect(() => {
    if (state.autoSaveEnabled && state.history.length > 0) {
      const timer = setTimeout(() => {
        // Simulate auto-save
        console.log('Auto-saving...', state)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [state.history, state.autoSaveEnabled])

  const contextValue: GlobalContextType = {
    state,
    dispatch: addAction,
    undo,
    redo,
    canUndo: state.currentIndex >= 0,
    canRedo: state.currentIndex < state.history.length - 1,
    setFrequencyCap,
    toggleAutoSave,
    toggleBestTime,
    setDefaultContentType,
  }

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobal() {
  const context = useContext(GlobalContext)
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider')
  }
  return context
}
