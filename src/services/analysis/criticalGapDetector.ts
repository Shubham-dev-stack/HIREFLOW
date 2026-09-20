import { RequirementAssessment } from './types';

export class CriticalGapDetector {
  /**
   * Identifies the primary critical uncertainty using strict priority ordering:
   * 1. Critical + Unknown
   * 2. Critical + Conflict
   * 3. Critical + Partial
   * 4. High + Unknown
   * 5. High + Conflict
   * 6. High + Partial
   */
  static detect(assessments: RequirementAssessment[]): RequirementAssessment | null {
    // 1. Critical + Unknown
    const critUnknown = assessments.find(a => a.importance === 'Critical' && a.status === 'UNKNOWN');
    if (critUnknown) return critUnknown;

    // 2. Critical + Conflict
    const critConflict = assessments.find(a => a.importance === 'Critical' && a.status === 'CONFLICT');
    if (critConflict) return critConflict;

    // 3. Critical + Partial
    const critPartial = assessments.find(a => a.importance === 'Critical' && a.status === 'PARTIAL');
    if (critPartial) return critPartial;

    // 4. High + Unknown
    const highUnknown = assessments.find(a => a.importance === 'High' && a.status === 'UNKNOWN');
    if (highUnknown) return highUnknown;

    // 5. High + Conflict
    const highConflict = assessments.find(a => a.importance === 'High' && a.status === 'CONFLICT');
    if (highConflict) return highConflict;

    // 6. High + Partial
    const highPartial = assessments.find(a => a.importance === 'High' && a.status === 'PARTIAL');
    if (highPartial) return highPartial;

    return null;
  }
}
