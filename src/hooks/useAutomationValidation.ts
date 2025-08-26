import { useState, useCallback } from 'react';
import { 
  AutomationNode, 
  AutomationConnection, 
  AutomationValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion 
} from '@/types/automation';
import { useToast } from '@/hooks/use-toast';

export function useAutomationValidation() {
  const [validationResult, setValidationResult] = useState<AutomationValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateFlow = useCallback(async (
    nodes: AutomationNode[], 
    connections: AutomationConnection[]
  ): Promise<AutomationValidationResult> => {
    setIsValidating(true);
    
    try {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      const suggestions: ValidationSuggestion[] = [];

      // Validação 1: Verificar loops infinitos
      const hasInfiniteLoop = detectInfiniteLoops(nodes, connections);
      if (hasInfiniteLoop.found) {
        errors.push({
          nodeId: hasInfiniteLoop.nodeId!,
          type: 'infinite_loop',
          message: 'Loop infinito detectado no fluxo',
          severity: 'error'
        });
      }

      // Validação 2: Limite máximo de nós (50)
      if (nodes.length > 50) {
        errors.push({
          nodeId: '',
          type: 'exceeded_limits', 
          message: `Muitos nós: ${nodes.length}/50. Simplifique o fluxo.`,
          severity: 'error'
        });
      }

      // Validação 3: Nós órfãos (sem conexões)
      const orphanNodes = findOrphanNodes(nodes, connections);
      orphanNodes.forEach(nodeId => {
        warnings.push({
          nodeId,
          type: 'best_practice',
          message: 'Nó sem conexões detectado',
          recommendation: 'Conecte este nó ao fluxo ou remova-o'
        });
      });

      // Validação 4: Configurações obrigatórias
      const missingConfigs = validateRequiredConfigs(nodes);
      missingConfigs.forEach(({ nodeId, message }) => {
        errors.push({
          nodeId,
          type: 'invalid_config',
          message,
          severity: 'error'
        });
      });

      // Validação 5: Limites de tempo (365 dias máximo)
      const timeExceeded = validateTimeConstraints(nodes);
      timeExceeded.forEach(nodeId => {
        errors.push({
          nodeId,
          type: 'exceeded_limits',
          message: 'Tempo de espera excede 365 dias',
          severity: 'error'
        });
      });

      // Sugestões de performance
      const performanceSuggestions = generatePerformanceSuggestions(nodes, connections);
      suggestions.push(...performanceSuggestions);

      // Sugestões de otimização
      const optimizationSuggestions = generateOptimizationSuggestions(nodes);
      suggestions.push(...optimizationSuggestions);

      const result: AutomationValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
      };

      setValidationResult(result);

      // Toast com resultado
      if (result.isValid) {
        toast({
          title: "✅ Fluxo Válido",
          description: `${warnings.length} avisos, ${suggestions.length} sugestões`,
          variant: "default"
        });
      } else {
        toast({
          title: "❌ Erros Encontrados",
          description: `${errors.length} erros impedem a ativação`,
          variant: "destructive"
        });
      }

      return result;

    } finally {
      setIsValidating(false);
    }
  }, [toast]);

  const detectInfiniteLoops = (
    nodes: AutomationNode[], 
    connections: AutomationConnection[]
  ): { found: boolean; nodeId?: string } => {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasLoop = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = connections.filter(conn => conn.sourceId === nodeId);
      for (const connection of outgoingConnections) {
        if (hasLoop(connection.targetId)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id) && hasLoop(node.id)) {
        return { found: true, nodeId: node.id };
      }
    }

    return { found: false };
  };

  const findOrphanNodes = (
    nodes: AutomationNode[], 
    connections: AutomationConnection[]
  ): string[] => {
    const connectedNodes = new Set<string>();
    connections.forEach(conn => {
      connectedNodes.add(conn.sourceId);
      connectedNodes.add(conn.targetId);
    });

    return nodes
      .filter(node => !connectedNodes.has(node.id) && node.type !== 'trigger')
      .map(node => node.id);
  };

  const validateRequiredConfigs = (nodes: AutomationNode[]): Array<{ nodeId: string; message: string }> => {
    const errors: Array<{ nodeId: string; message: string }> = [];

    nodes.forEach(node => {
      switch (node.type) {
        case 'action':
          if (!node.data.config.actionType) {
            errors.push({
              nodeId: node.id,
              message: 'Tipo de ação não definido'
            });
          }
          
          if (node.data.config.actionType === 'send_email' && !node.data.config.templateId) {
            errors.push({
              nodeId: node.id,
              message: 'Template de email obrigatório'
            });
          }

          if (node.data.config.actionType === 'wait_time') {
            const { waitDays = 0, waitHours = 0, waitMinutes = 0 } = node.data.config;
            if (waitDays === 0 && waitHours === 0 && waitMinutes === 0) {
              errors.push({
                nodeId: node.id,
                message: 'Tempo de espera deve ser maior que zero'
              });
            }
          }
          break;

        case 'trigger':
          if (!node.data.config.triggerType) {
            errors.push({
              nodeId: node.id,
              message: 'Tipo de trigger não definido'
            });
          }
          break;
      }
    });

    return errors;
  };

  const validateTimeConstraints = (nodes: AutomationNode[]): string[] => {
    const exceededNodes: string[] = [];

    nodes.forEach(node => {
      if (node.type === 'action' && node.data.config.actionType === 'wait_time') {
        const totalDays = (node.data.config.waitDays || 0) + 
                         (node.data.config.waitHours || 0) / 24 + 
                         (node.data.config.waitMinutes || 0) / (24 * 60);
        
        if (totalDays > 365) {
          exceededNodes.push(node.id);
        }
      }
    });

    return exceededNodes;
  };

  const generatePerformanceSuggestions = (
    nodes: AutomationNode[], 
    connections: AutomationConnection[]
  ): ValidationSuggestion[] => {
    const suggestions: ValidationSuggestion[] = [];

    // Sugestão: Adicionar reenvio para emails sem follow-up
    const emailNodes = nodes.filter(n => 
      n.type === 'action' && n.data.config.actionType === 'send_email'
    );

    emailNodes.forEach(emailNode => {
      const hasFollowUp = connections.some(conn => conn.sourceId === emailNode.id);
      if (!hasFollowUp) {
        suggestions.push({
          nodeId: emailNode.id,
          type: 'optimization',
          message: 'Considere adicionar reenvio para não-abertos',
          actionLabel: 'Adicionar Reenvio',
          actionType: 'add_node'
        });
      }
    });

    // Sugestão: Segmentação Heat em fluxos simples
    const hasHeatSegmentation = nodes.some(n => 
      n.data.config.actionType === 'heat_segmentation'
    );

    if (!hasHeatSegmentation && nodes.length > 5) {
      suggestions.push({
        type: 'enhancement',
        message: 'Fluxo complexo pode se beneficiar de segmentação Heat',
        actionLabel: 'Adicionar Heat Segments',
        actionType: 'add_node'
      });
    }

    return suggestions;
  };

  const generateOptimizationSuggestions = (nodes: AutomationNode[]): ValidationSuggestion[] => {
    const suggestions: ValidationSuggestion[] = [];

    // Sugestão: A/B test em emails críticos
    const emailCount = nodes.filter(n => 
      n.type === 'action' && n.data.config.actionType === 'send_email'
    ).length;

    if (emailCount >= 3) {
      const hasAbTest = nodes.some(n => n.data.config.actionType === 'split_ab');
      if (!hasAbTest) {
        suggestions.push({
          type: 'optimization',
          message: 'Considere A/B testing no email principal',
          actionLabel: 'Adicionar A/B Test',
          actionType: 'add_node'
        });
      }
    }

    // Sugestão: Timing optimization
    const waitNodes = nodes.filter(n => 
      n.type === 'action' && n.data.config.actionType === 'wait_time'
    );

    waitNodes.forEach(waitNode => {
      const waitDays = waitNode.data.config.waitDays || 0;
      if (waitDays > 30) {
        suggestions.push({
          nodeId: waitNode.id,
          type: 'optimization',
          message: 'Espera longa pode causar perda de engajamento',
          actionLabel: 'Otimizar Timing',
          actionType: 'modify_config'
        });
      }
    });

    return suggestions;
  };

  const validateInRealTime = useCallback((
    nodes: AutomationNode[], 
    connections: AutomationConnection[]
  ) => {
    // Validação rápida em tempo real (sem delays)
    const quickErrors: ValidationError[] = [];

    // Verificar nós desconectados
    const orphans = findOrphanNodes(nodes, connections);
    if (orphans.length > 0) {
      quickErrors.push({
        nodeId: orphans[0],
        type: 'missing_connection',
        message: `${orphans.length} nó(s) desconectado(s)`,
        severity: 'warning'
      });
    }

    // Verificar limite de nós
    if (nodes.length > 50) {
      quickErrors.push({
        nodeId: '',
        type: 'exceeded_limits',
        message: 'Limite de 50 nós excedido',
        severity: 'error'
      });
    }

    setValidationResult(prev => prev ? {
      ...prev,
      errors: quickErrors
    } : null);

    return quickErrors.length === 0;
  }, []);

  return {
    validateFlow,
    validateInRealTime,
    validationResult,
    isValidating,
    clearValidation: () => setValidationResult(null)
  };
}