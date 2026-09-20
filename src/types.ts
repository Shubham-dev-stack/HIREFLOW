export type Importance = 'Critical' | 'High' | 'Medium' | 'Low';

export type EvidenceStatus = 'SUPPORTED' | 'PARTIAL' | 'UNKNOWN' | 'CONFLICT' | 'HUMAN_REVIEW';

export type ProvenanceSource = 'ai' | 'heuristic';
export type EvidenceType = 'self_claimed' | 'corroborated';

export interface ConflictSnippet {
  source: string;
  sourceLocation?: string;
  snippet: string;
  type: EvidenceType;
  label?: string;
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  phase: 'OBSERVE' | 'DECIDE' | 'ANALYZE' | 'ACT' | 'RE-EVALUATE' | 'STOP';
  message: string;
  isStop?: boolean;
}

export interface Requirement {
  id: string;
  name: string;
  importance: Importance;
  status: EvidenceStatus;
  evidence: string;
  source: string;
  sourceLocation: string;
  reasoning: string;
  gapReasoning?: string;
  snippet?: string;
  validationTarget?: string;
  provenance?: ProvenanceSource;
  evidenceType?: EvidenceType;
  corroboratedCount?: number;
  claimedCount?: number;
  conflictSnippets?: ConflictSnippet[];
}

import { ParsedDocument } from './services/analysis/documentParser';

export interface CandidateDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  pages?: number;
  wordCount?: number;
  uploadTime: string;
  isPrimary?: boolean;
  parsed?: ParsedDocument;
  error?: string;
}

export interface Candidate {
  id: string;
  name: string;
  targetRole: string;
  documents: CandidateDocument[];
  parsedDocuments?: ParsedDocument[];
  interviewNotes?: string;
  portfolioUrl?: string;
}

export interface Role {
  title: string;
  department: string;
  location: string;
  description: string;
  parsedDoc?: ParsedDocument;
}

export interface EvaluationAreaItem {
  area: string;
  description: string;
  rating?: 'Satisfied' | 'Partial' | 'Missing';
  note?: string;
}

export interface ValidationItem {
  id: string;
  requirementId: string;
  requirementName: string;
  title: string;
  scenario: string;
  evaluationAreas: EvaluationAreaItem[];
  rationale: string;
  estimatedTime: string;
  defaultResponse: string;
  candidateResponse: string;
  evaluated: boolean;
  evaluatedAt?: string;
  resultEvidence?: string;
  resultSource?: string;
  resultReasoning?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  title: string;
  category: 'ROLE' | 'EVIDENCE' | 'VALIDATION' | 'DECISION' | 'SYSTEM';
  requirement?: string;
  previousStatus?: EvidenceStatus;
  newStatus?: EvidenceStatus;
  source?: string;
  evidence?: string;
  reasoning?: string;
  nextAction?: string;
  user?: string;
}

export type WorkflowStepId = 
  | '01_ROLE' 
  | '02_CANDIDATES' 
  | '03_EVIDENCE' 
  | '04_DECISION_QA' 
  | '05_VALIDATION' 
  | '06_REVIEW'
  | 'AUDIT_TRAIL';

export type DecisionOutcome = 'PROCEED' | 'REQUEST_MORE_EVIDENCE' | 'HOLD_FOR_REVIEW';
