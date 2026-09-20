import { RequirementAssessment, DecisionQAResult } from './types';
import { CriticalGapDetector } from './criticalGapDetector';
import { Importance, EvidenceStatus } from '../../types';

export class DecisionQAEngine {
  /**
   * Deterministic weights per spec:
   * Critical = 4.0, High = 2.0, Medium = 1.0, Low = 0.5
   */
  static getImportanceWeight(importance: Importance): number {
    switch (importance) {
      case 'Critical': return 4.0;
      case 'High': return 2.0;
      case 'Medium': return 1.0;
      case 'Low': return 0.5;
      default: return 1.0;
    }
  }

  /**
   * Status contribution per spec:
   * SUPPORTED = 1.0 (100%), PARTIAL = 0.5 (50%), HUMAN_REVIEW = 0.4 (40%), UNKNOWN = 0.0, CONFLICT = 0.0
   */
  static getStatusContribution(status: EvidenceStatus): number {
    switch (status) {
      case 'SUPPORTED': return 1.0;
      case 'PARTIAL': return 0.5;
      case 'HUMAN_REVIEW': return 0.4;
      case 'UNKNOWN':
      case 'CONFLICT':
      default: return 0.0;
    }
  }

  /**
   * Pure deterministic calculation:
   * Readiness = Math.round((EarnedWeight / TotalWeight) * 100)
   * Threshold for 'READY FOR HUMAN REVIEW' = 80% (when no Critical gaps remain).
   */
  static evaluate(assessments: RequirementAssessment[]): DecisionQAResult {
    const supportedCount = assessments.filter(a => a.status === 'SUPPORTED').length;
    const partialCount = assessments.filter(a => a.status === 'PARTIAL').length;
    const unknownCount = assessments.filter(a => a.status === 'UNKNOWN').length;
    const conflictCount = assessments.filter(a => a.status === 'CONFLICT').length;

    const criticalUncertainty = CriticalGapDetector.detect(assessments);

    let totalWeight = 0;
    let earnedWeight = 0;

    assessments.forEach(a => {
      const weight = DecisionQAEngine.getImportanceWeight(a.importance);
      totalWeight += weight;
      const contribution = DecisionQAEngine.getStatusContribution(a.status);
      earnedWeight += weight * contribution;
    });

    const readiness = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    // Decision state gated by critical uncertainties & 80% threshold
    const hasCriticalUncertainty = assessments.some(
      a => a.importance === 'Critical' && (a.status === 'UNKNOWN' || a.status === 'CONFLICT')
    );

    let state: 'NOT READY' | 'READY FOR HUMAN REVIEW' | 'FULLY VALIDATED' = 'NOT READY';
    let explanation = '';

    if (hasCriticalUncertainty || readiness < 80) {
      state = 'NOT READY';
      explanation = criticalUncertainty 
        ? `${criticalUncertainty.name} is a critical requirement and currently lacks sufficient evidence for a confident human assessment.`
        : `Overall evidence readiness (${readiness}%) is below the 80% human review threshold.`;
    } else if (unknownCount === 0 && conflictCount === 0 && partialCount === 0) {
      state = 'FULLY VALIDATED';
      explanation = 'All core competencies are empirically verified with direct source citations.';
    } else {
      state = 'READY FOR HUMAN REVIEW';
      explanation = 'Critical uncertainties have been resolved. Evidence coverage exceeds the 80% human review threshold.';
    }

    const breakdownNote = `${assessments.length} requirements • ${supportedCount} supported • ${criticalUncertainty ? '1 critical uncertainty' : '0 critical gaps'} • ${partialCount} partial`;

    return {
      readiness,
      state,
      supportedCount,
      partialCount,
      unknownCount,
      conflictCount,
      criticalUncertainty,
      explanation,
      breakdownNote
    };
  }

  /**
   * Pure function to compute the decision levers for all requirements.
   * Leverages the existing DecisionQAEngine.evaluate formula.
   */
  static computeLevers(assessments: RequirementAssessment[]): DecisionLever[] {
    return computeLevers(assessments);
  }
}

export interface DecisionLever {
  requirementId: string;
  requirementName: string;
  importance: Importance;
  weight: number;
  earnedWeight: number;
  currentStatus: EvidenceStatus;
  targetStatusText: string;
  currentReadiness: number;
  projectedReadiness: number;
  delta: number; // e.g. 21.6
  deltaFormatted: string; // "+21.6%"
  isSupported: boolean;
  isTopLever: boolean;
  barPercentage: number;
}

/**
 * Pure function computeLevers(requirements, currentStatuses):
 * - For EACH requirement that is NOT already SUPPORTED:
 *   Clone the status array, set that one requirement to SUPPORTED,
 *   recompute readiness using the EXISTING formula (same weights, same function),
 *   record delta = newReadiness - currentReadiness.
 * - Sort by delta descending.
 * - Return array of { requirementName, currentStatus, delta }.
 */
export function computeLevers(assessments: RequirementAssessment[]): DecisionLever[] {
  let totalWeight = 0;
  assessments.forEach(a => {
    totalWeight += DecisionQAEngine.getImportanceWeight(a.importance);
  });

  const currentResult = DecisionQAEngine.evaluate(assessments);

  const levers: DecisionLever[] = assessments.map(a => {
    const weight = DecisionQAEngine.getImportanceWeight(a.importance);
    const currentContribution = DecisionQAEngine.getStatusContribution(a.status);
    const earnedWeight = weight * currentContribution;

    if (a.status === 'SUPPORTED') {
      return {
        requirementId: a.requirementId,
        requirementName: a.name,
        importance: a.importance,
        weight,
        earnedWeight,
        currentStatus: a.status,
        targetStatusText: 'already SUPPORTED',
        currentReadiness: currentResult.readiness,
        projectedReadiness: currentResult.readiness,
        delta: 0,
        deltaFormatted: '+0.0%',
        isSupported: true,
        isTopLever: false,
        barPercentage: 0
      };
    }

    // Clone array and set that one requirement to SUPPORTED
    const cloned = assessments.map(item =>
      item.requirementId === a.requirementId ? { ...item, status: 'SUPPORTED' as EvidenceStatus } : item
    );

    const newResult = DecisionQAEngine.evaluate(cloned);

    // Calculate exact percentage delta using the exact weight formula:
    const gain = weight * (1.0 - currentContribution);
    const exactDelta = totalWeight > 0 ? (gain / totalWeight) * 100 : 0;
    const roundedDelta = parseFloat(exactDelta.toFixed(1));

    const targetStatusText = a.status === 'CONFLICT' 
      ? 'CONFLICT → RESOLVED' 
      : `${a.status} → SUPPORTED`;

    return {
      requirementId: a.requirementId,
      requirementName: a.name,
      importance: a.importance,
      weight,
      earnedWeight,
      currentStatus: a.status,
      targetStatusText,
      currentReadiness: currentResult.readiness,
      projectedReadiness: newResult.readiness,
      delta: roundedDelta,
      deltaFormatted: `+${roundedDelta.toFixed(1)}%`,
      isSupported: false,
      isTopLever: false,
      barPercentage: 0
    };
  });

  // Sort by delta descending
  levers.sort((a, b) => b.delta - a.delta);

  const maxDelta = levers.length > 0 ? Math.max(...levers.map(l => l.delta)) : 1;

  levers.forEach((lever, idx) => {
    lever.barPercentage = maxDelta > 0 ? (lever.delta / maxDelta) * 100 : 0;
    if (idx === 0 && lever.delta > 0) {
      lever.isTopLever = true;
    }
  });

  return levers;
}

