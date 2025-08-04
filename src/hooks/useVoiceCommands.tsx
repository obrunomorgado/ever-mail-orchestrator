import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePlanner } from '@/contexts/PlannerContext';

interface VoiceCommand {
  pattern: RegExp;
  action: (matches: RegExpMatchArray) => void;
  description: string;
}

export function useVoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();
  const { moveSegment, autoOptimizeSchedule } = usePlanner();

  useEffect(() => {
    // Check if SpeechRecognition is supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'pt-BR';
    }
  }, []);

  const commands: VoiceCommand[] = [
    {
      pattern: /agendar (.+) (?:amanhã|hoje) (?:às )?(\d{1,2})(?:h| horas?)?/i,
      action: (matches) => {
        const segment = matches[1];
        const hour = parseInt(matches[2]);
        toast({
          title: "Comando de Voz Reconhecido",
          description: `Agendando ${segment} para ${hour}:00h`,
        });
        // Logic to find and move segment would go here
      },
      description: "Agendar [segmento] hoje/amanhã às [hora]h"
    },
    {
      pattern: /otimizar (?:automaticamente|tudo|campanha)/i,
      action: () => {
        autoOptimizeSchedule();
        toast({
          title: "Comando de Voz",
          description: "Iniciando otimização automática...",
        });
      },
      description: "Otimizar automaticamente"
    },
    {
      pattern: /mover (.+) para (?:às )?(\d{1,2})(?:h| horas?)?/i,
      action: (matches) => {
        const segment = matches[1];
        const hour = parseInt(matches[2]);
        toast({
          title: "Comando de Voz",
          description: `Movendo ${segment} para ${hour}:00h`,
        });
        // Logic to move segment would go here
      },
      description: "Mover [segmento] para [hora]h"
    },
    {
      pattern: /pausar (?:todas as )?campanhas?/i,
      action: () => {
        toast({
          title: "Comando de Voz",
          description: "Pausando todas as campanhas...",
          variant: "destructive"
        });
        // Logic to pause campaigns would go here
      },
      description: "Pausar campanhas"
    },
    {
      pattern: /duplicar (.+)/i,
      action: (matches) => {
        const segment = matches[1];
        toast({
          title: "Comando de Voz",
          description: `Duplicando campanha ${segment}`,
        });
        // Logic to duplicate segment would go here
      },
      description: "Duplicar [segmento]"
    }
  ];

  const processVoiceCommand = (transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const command of commands) {
      const matches = normalizedTranscript.match(command.pattern);
      if (matches) {
        command.action(matches);
        return true;
      }
    }
    
    toast({
      title: "Comando não reconhecido",
      description: `"${transcript}" não foi compreendido. Tente: "${commands[0].description}"`,
      variant: "destructive"
    });
    return false;
  };

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) {
      toast({
        title: "Comando de Voz Não Suportado",
        description: "Seu navegador não suporta reconhecimento de voz",
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: "Erro no Reconhecimento",
        description: "Não foi possível processar o comando de voz",
        variant: "destructive"
      });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    
    toast({
      title: "Escutando...",
      description: "Fale seu comando agora",
    });
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    commands: commands.map(cmd => cmd.description)
  };
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  }
}