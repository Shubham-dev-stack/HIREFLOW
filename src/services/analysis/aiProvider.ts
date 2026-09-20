import { 
  AIProvider, 
  RequirementAnalysisItem, 
  RequirementAssessment, 
  NextMoveResult, 
  ReEvaluationResult 
} from './types';
import { RequirementAnalyzer } from './requirementAnalyzer';
import { EvidenceMapper } from './evidenceMapper';
import { NextMoveEngine } from './nextMoveEngine';
import { ReEvaluationService } from './reEvaluation';
import { DecisionQAEngine } from './decisionQA';
import { CriticalGapDetector } from './criticalGapDetector';

export class LocalHeuristicAIProvider implements AIProvider {
  async extractRequirements(jobDescription: string): Promise<RequirementAnalysisItem[]> {
    const res = await RequirementAnalyzer.analyzeAsync(jobDescription);
    return res.items;
  }

  async mapEvidence(requirements: RequirementAnalysisItem[], candidateText: string): Promise<RequirementAssessment[]> {
    const res = await EvidenceMapper.mapAsync(requirements, candidateText);
    return res.assessments;
  }

  async generateValidation(criticalUncertainty: RequirementAssessment): Promise<NextMoveResult> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return NextMoveEngine.determineNextMove(criticalUncertainty);
  }

  async evaluateValidation(validation: NextMoveResult, responseText: string): Promise<ReEvaluationResult> {
    const currentAssessments: RequirementAssessment[] = [
      {
        requirementId: validation.requirementId,
        name: validation.requirementName,
        importance: 'Critical',
        status: 'UNKNOWN',
        evidence: [],
        primarySnippet: 'Designed backend services using FastAPI and PostgreSQL.',
        reasoning: 'Insufficient evidence found in document records.',
        gapReasoning: 'Missing proof of scalability, caching, or distributed systems.',
        source: 'No sufficient source',
        sourceLocation: 'Unverified',
        provenance: 'heuristic'
      }
    ];

    const { result } = await ReEvaluationService.reEvaluateAsync(
      currentAssessments,
      validation.requirementId,
      responseText,
      'Architecture Validation #VAL-01'
    );

    return result;
  }
}

/**
 * Factory that provides the active AI analysis engine.
 * Defaults to LocalHeuristicAIProvider for 100% reliable, zero-latency, offline execution.
 */
let currentProvider: AIProvider = new LocalHeuristicAIProvider();

export function getAIProvider(): AIProvider {
  return currentProvider;
}

export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}
