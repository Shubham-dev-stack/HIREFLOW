import { EvidenceStrength } from './types';
import { EvidenceStatus } from '../../types';

export class StatusClassifier {
  /**
   * Classifies evidence strength into an evidence-first status.
   * Core Principle: Missing evidence yields UNKNOWN, never an assumed lack of skill.
   */
  static classify(strength: EvidenceStrength, hasDirectProof: boolean, hasGaps: boolean): EvidenceStatus {
    switch (strength) {
      case 'DIRECT':
        return hasGaps ? 'PARTIAL' : 'SUPPORTED';
      case 'INDIRECT':
      case 'WEAK':
        return 'PARTIAL';
      case 'CONFLICTING':
        return 'CONFLICT';
      case 'MISSING':
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Generates analytical diagnostic explanations adhering to evidence-first guidelines.
   */
  static generateReasoning(
    requirementName: string, 
    status: EvidenceStatus, 
    snippet: string,
    isDirect: boolean
  ): { reasoning: string; gapReasoning?: string } {
    switch (status) {
      case 'SUPPORTED':
        return {
          reasoning: `Direct, verifiable evidence identified for ${requirementName} in production context.`
        };
      case 'PARTIAL':
        return {
          reasoning: `Partial evidence found for ${requirementName}; standard implementation referenced, but high-scale or advanced patterns remain unverified.`,
          gapReasoning: `Evidence demonstrates foundational familiarity, but lacks confirmation of advanced lifecycle, resilience, or architectural depth.`
        };
      case 'UNKNOWN':
        return {
          reasoning: `Insufficient evidence found in submitted records to evaluate ${requirementName}.`,
          gapReasoning: `Unknown signifies insufficient evidence in the document records. It does NOT indicate the candidate lacks the skill.`
        };
      case 'CONFLICT':
        return {
          reasoning: `Conflicting statements detected regarding ${requirementName} across candidate submissions.`,
          gapReasoning: `Requires targeted clarification to resolve discrepancy between claimed and documented experience.`
        };
      case 'HUMAN_REVIEW':
        return {
          reasoning: `Contextual nuance around ${requirementName} requires direct interviewer assessment.`,
          gapReasoning: `Flagged for qualitative debrief discussion.`
        };
    }
  }
}
