import { CampaignSegment, PlannedCampaign } from '@/contexts/PlannerContext';

export interface SlotRecommendation {
  slot: { date: string; timeSlot: string };
  score: number;
  confidence: number;
  estimatedRevenue: number;
  estimatedClicks: number;
  reasons: string[];
  risks: ConflictRisk[];
  historicalPerformance: {
    avgCTR: number;
    avgRevenue: number;
    deliverabilityScore: number;
  };
}

export interface ConflictRisk {
  type: 'audience_overlap' | 'frequency_cap' | 'deliverability' | 'cannibalisation';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: {
    revenueReduction: number;
    ctrReduction: number;
  };
  suggestions: string[];
}

export interface OptimizationGoal {
  type: 'revenue' | 'reach' | 'engagement' | 'balanced';
  priority: number;
  constraints: {
    maxAudienceOverlap?: number;
    minDeliverabilityScore?: number;
    maxFrequencyPerDay?: number;
  };
}

export class RevenueOptimizer {
  private historicalData: Record<string, {
    avgCTR: number;
    avgRevenue: number;
    deliverabilityScore: number;
    successRate: number;
  }> = {
    '09:00': { avgCTR: 0.045, avgRevenue: 12.5, deliverabilityScore: 92, successRate: 0.85 },
    '12:00': { avgCTR: 0.038, avgRevenue: 9.8, deliverabilityScore: 88, successRate: 0.75 },
    '15:00': { avgCTR: 0.042, avgRevenue: 11.2, deliverabilityScore: 90, successRate: 0.80 },
    '18:00': { avgCTR: 0.052, avgRevenue: 15.1, deliverabilityScore: 95, successRate: 0.90 },
    '20:00': { avgCTR: 0.048, avgRevenue: 13.7, deliverabilityScore: 93, successRate: 0.88 },
  };

  private audienceOverlapThreshold = 0.3; // 30% overlap considerado alto risco

  /**
   * Recommends the best slots for a given segment based on revenue optimization
   */
  recommendBestSlots(
    segment: CampaignSegment,
    goal: OptimizationGoal,
    existingCampaigns: Record<string, Record<string, PlannedCampaign[]>>,
    availableSlots: { date: string; timeSlot: string }[]
  ): SlotRecommendation[] {
    const recommendations: SlotRecommendation[] = [];

    for (const slot of availableSlots) {
      const score = this.calculateSlotScore(segment, slot, goal, existingCampaigns);
      const conflicts = this.detectConflicts(segment, slot, existingCampaigns);
      const historical = this.historicalData[slot.timeSlot] || this.getDefaultHistorical();
      
      const estimatedCTR = historical.avgCTR * (1 - this.getConflictImpact(conflicts));
      const estimatedClicks = segment.size * estimatedCTR;
      const estimatedRevenue = estimatedClicks * segment.erpm;

      recommendations.push({
        slot,
        score,
        confidence: this.calculateConfidence(historical, conflicts),
        estimatedRevenue,
        estimatedClicks,
        reasons: this.generateReasons(segment, slot, historical, goal),
        risks: conflicts,
        historicalPerformance: historical
      });
    }

    // Sort by score (revenue potential - risk impact)
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 recommendations
  }

  /**
   * Detects conflicts before scheduling a campaign
   */
  detectConflicts(
    segment: CampaignSegment,
    slot: { date: string; timeSlot: string },
    existingCampaigns: Record<string, Record<string, PlannedCampaign[]>>
  ): ConflictRisk[] {
    const conflicts: ConflictRisk[] = [];
    const existingInSlot = existingCampaigns[slot.date]?.[slot.timeSlot] || [];

    // Audience overlap detection
    for (const existing of existingInSlot) {
      const overlap = this.calculateAudienceOverlap(segment, existing);
      if (overlap > this.audienceOverlapThreshold) {
        conflicts.push({
          type: 'audience_overlap',
          severity: overlap > 0.6 ? 'high' : 'medium',
          description: `${Math.round(overlap * 100)}% sobreposição de audiência com "${existing.name}"`,
          impact: {
            revenueReduction: overlap * 0.4, // 40% revenue reduction per overlap
            ctrReduction: overlap * 0.3
          },
          suggestions: [
            'Considere um horário diferente',
            'Refine a segmentação para reduzir overlap',
            'Use frequency cap mais restritivo'
          ]
        });
      }
    }

    // Frequency cap violation
    if (existingInSlot.length >= 2) {
      conflicts.push({
        type: 'frequency_cap',
        severity: 'high',
        description: 'Limite de frequência excedido para este horário',
        impact: {
          revenueReduction: 0.25,
          ctrReduction: 0.35
        },
        suggestions: [
          'Mova para um horário com menos campanhas',
          'Ajuste o frequency cap global'
        ]
      });
    }

    // Deliverability risk
    const historical = this.historicalData[slot.timeSlot];
    if (historical && historical.deliverabilityScore < 85) {
      conflicts.push({
        type: 'deliverability',
        severity: historical.deliverabilityScore < 80 ? 'high' : 'medium',
        description: `Score de deliverabilidade baixo (${historical.deliverabilityScore}%)`,
        impact: {
          revenueReduction: (90 - historical.deliverabilityScore) / 100,
          ctrReduction: (90 - historical.deliverabilityScore) / 200
        },
        suggestions: [
          'Aqueça a reputação antes de usar este horário',
          'Use um segmento menor para teste'
        ]
      });
    }

    return conflicts;
  }

  /**
   * Calculates missed revenue opportunities
   */
  calculateMissedOpportunities(
    currentPlans: Record<string, Record<string, PlannedCampaign[]>>,
    availableSegments: CampaignSegment[]
  ): {
    totalMissedRevenue: number;
    opportunities: Array<{
      segment: CampaignSegment;
      optimalSlot: { date: string; timeSlot: string };
      missedRevenue: number;
      reason: string;
    }>;
  } {
    const opportunities = [];
    let totalMissedRevenue = 0;

    for (const segment of availableSegments) {
      const bestSlot = this.findOptimalSlotForSegment(segment, currentPlans);
      if (bestSlot) {
        const historical = this.historicalData[bestSlot.timeSlot];
        const missedRevenue = segment.size * historical.avgCTR * segment.erpm;
        
        opportunities.push({
          segment,
          optimalSlot: bestSlot,
          missedRevenue,
          reason: `Segmento otimizado para ${bestSlot.timeSlot} com performance ${historical.successRate * 100}% acima da média`
        });
        
        totalMissedRevenue += missedRevenue;
      }
    }

    return { totalMissedRevenue, opportunities };
  }

  private calculateSlotScore(
    segment: CampaignSegment,
    slot: { date: string; timeSlot: string },
    goal: OptimizationGoal,
    existingCampaigns: Record<string, Record<string, PlannedCampaign[]>>
  ): number {
    const historical = this.historicalData[slot.timeSlot] || this.getDefaultHistorical();
    const conflicts = this.detectConflicts(segment, slot, existingCampaigns);
    
    // Base score from historical performance
    let score = historical.avgRevenue * historical.successRate;
    
    // Adjust for goal type
    switch (goal.type) {
      case 'revenue':
        score *= 1.2; // Boost revenue-focused slots
        break;
      case 'reach':
        score *= (segment.size / 100000); // Favor larger segments
        break;
      case 'engagement':
        score *= (segment.ctr * 2); // Boost high-CTR segments
        break;
    }
    
    // Reduce score based on conflicts
    const conflictPenalty = conflicts.reduce((penalty, conflict) => {
      return penalty + conflict.impact.revenueReduction;
    }, 0);
    
    return Math.max(score * (1 - conflictPenalty), 0);
  }

  private calculateAudienceOverlap(segment1: CampaignSegment, segment2: PlannedCampaign): number {
    // Simplified overlap calculation based on tags and vertical
    const commonTags = segment1.tags.filter(tag => segment2.tags.includes(tag)).length;
    const totalTags = new Set([...segment1.tags, ...segment2.tags]).size;
    const tagOverlap = commonTags / totalTags;
    
    const verticalMatch = segment1.vertical === segment2.vertical ? 0.3 : 0;
    const rfmSimilarity = this.calculateRFMSimilarity(segment1.rfm, segment2.rfm);
    
    return Math.min(tagOverlap + verticalMatch + rfmSimilarity, 1);
  }

  private calculateRFMSimilarity(rfm1: string, rfm2: string): number {
    // Simple RFM similarity - same category = higher overlap
    return rfm1 === rfm2 ? 0.2 : 0;
  }

  private getConflictImpact(conflicts: ConflictRisk[]): number {
    return conflicts.reduce((impact, conflict) => {
      return impact + conflict.impact.revenueReduction;
    }, 0);
  }

  private calculateConfidence(
    historical: { successRate: number; deliverabilityScore: number },
    conflicts: ConflictRisk[]
  ): number {
    let confidence = historical.successRate;
    
    // Reduce confidence based on conflicts
    for (const conflict of conflicts) {
      switch (conflict.severity) {
        case 'high':
          confidence *= 0.7;
          break;
        case 'medium':
          confidence *= 0.85;
          break;
        case 'low':
          confidence *= 0.95;
          break;
      }
    }
    
    return Math.max(confidence, 0.1); // Minimum 10% confidence
  }

  private generateReasons(
    segment: CampaignSegment,
    slot: { date: string; timeSlot: string },
    historical: { avgCTR: number; avgRevenue: number; successRate: number },
    goal: OptimizationGoal
  ): string[] {
    const reasons = [];
    
    if (historical.successRate > 0.8) {
      reasons.push(`Horário com ${Math.round(historical.successRate * 100)}% de taxa de sucesso`);
    }
    
    if (historical.avgCTR > 0.04) {
      reasons.push(`CTR histórico acima da média (${(historical.avgCTR * 100).toFixed(1)}%)`);
    }
    
    if (segment.vertical === 'cartao' && slot.timeSlot === '18:00') {
      reasons.push('Horário otimizado para audiência de cartão de crédito');
    }
    
    if (goal.type === 'revenue' && historical.avgRevenue > 12) {
      reasons.push('Horário de alta conversão para objetivo de receita');
    }
    
    return reasons;
  }

  private findOptimalSlotForSegment(
    segment: CampaignSegment,
    currentPlans: Record<string, Record<string, PlannedCampaign[]>>
  ): { date: string; timeSlot: string } | null {
    // Find the best available slot based on historical performance
    const timeSlots = Object.keys(this.historicalData);
    let bestSlot = null;
    let bestScore = 0;
    
    for (const timeSlot of timeSlots) {
      const historical = this.historicalData[timeSlot];
      if (historical) {
        const score = historical.avgRevenue * historical.successRate;
        
        if (score > bestScore) {
          bestScore = score;
          bestSlot = { date: new Date().toISOString().split('T')[0], timeSlot };
        }
      }
    }
    
    return bestSlot;
  }

  private getDefaultHistorical() {
    return {
      avgCTR: 0.04,
      avgRevenue: 10,
      deliverabilityScore: 85,
      successRate: 0.75
    };
  }
}

export const revenueOptimizer = new RevenueOptimizer();