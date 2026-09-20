import { Importance, EvidenceStatus, EvidenceType, ConflictSnippet } from '../../types';

export type EvidenceStrength = 'DIRECT' | 'INDIRECT' | 'WEAK' | 'MISSING' | 'CONFLICTING';

export interface RequirementAnalysisItem {
  id: string;
  name: string;
  importance: Importance;
  description: string;
  whyItMatters: string;
  provenance?: 'ai' | 'heuristic';
}

export interface EvidenceItem {
  id: string;
  requirementId: string;
  source: string;
  sourceLocation: string;
  snippet: string;
  status: EvidenceStatus;
  strength: EvidenceStrength;
  reasoning: string;
  gapReasoning?: string;
  provenance?: 'ai' | 'heuristic';
  evidenceType?: EvidenceType;
}

export interface RequirementAssessment {
  requirementId: string;
  name: string;
  importance: Importance;
  status: EvidenceStatus;
  evidence: EvidenceItem[];
  primarySnippet: string;
  reasoning: string;
  gapReasoning?: string;
  source: string;
  sourceLocation: string;
  provenance?: 'ai' | 'heuristic';
  evidenceType?: EvidenceType;
  corroboratedCount?: number;
  claimedCount?: number;
  conflictSnippets?: ConflictSnippet[];
}

export interface DecisionQAResult {
  readiness: number;
  state: 'NOT READY' | 'READY FOR HUMAN REVIEW' | 'FULLY VALIDATED';
  supportedCount: number;
  partialCount: number;
  unknownCount: number;
  conflictCount: number;
  criticalUncertainty: RequirementAssessment | null;
  explanation: string;
  breakdownNote: string;
}

export interface NextMoveResult {
  requirementId: string;
  requirementName: string;
  action: string;
  reason: string;
  estimatedTime: string;
  validationType: string;
  scenario: string;
  evaluationAreas: { area: string; description: string }[];
}

export interface ReEvaluationResult {
  requirementId: string;
  previousStatus: EvidenceStatus;
  newStatus: EvidenceStatus;
  newEvidence: EvidenceItem;
  newDecisionQA: DecisionQAResult;
  nextUncertainty: RequirementAssessment | null;
  nextMove: NextMoveResult | null;
  explanation: string;
}

export interface AIProvider {
  extractRequirements(jobDescription: string): Promise<RequirementAnalysisItem[]>;
  mapEvidence(requirements: RequirementAnalysisItem[], candidateText: string): Promise<RequirementAssessment[]>;
  generateValidation(criticalUncertainty: RequirementAssessment): Promise<NextMoveResult>;
  evaluateValidation(validation: NextMoveResult, responseText: string): Promise<ReEvaluationResult>;
}
