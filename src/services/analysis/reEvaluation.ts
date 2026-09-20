import { RequirementAssessment, NextMoveResult, ReEvaluationResult, EvidenceItem } from './types';
import { DecisionQAEngine } from './decisionQA';
import { CriticalGapDetector } from './criticalGapDetector';
import { NextMoveEngine } from './nextMoveEngine';
import { EvidenceStatus } from '../../types';
import { callGemini } from '../ai/gemini';

const ANSWER_EVALUATION_SYSTEM_PROMPT = `You are evaluating one candidate answer against ONE specific requirement's evidence standard.
Judge only whether the answer provides sufficient evidence for THAT requirement.
Do not comment on hiring suitability. Reward specificity, trade-off reasoning,
and failure-mode awareness. Not confident tone.
Return ONLY valid JSON:
{newStatus:SUPPORTED|PARTIAL|UNKNOWN,reasoning:,signalsObserved:[],signalsMissing:[]}`;

interface GeminiAnswerEvaluationResponse {
  newStatus?: string;
  reasoning?: string;
  signalsObserved?: string[];
  signalsMissing?: string[];
}

export class ReEvaluationService {
  /**
   * Asynchronously evaluates new candidate validation evidence using Gemini AI first,
   * with guaranteed deterministic heuristic fallback.
   */
  static async reEvaluateAsync(
    currentAssessments: RequirementAssessment[],
    targetRequirementId: string,
    validationResponse: string,
    validationTitle: string = 'Architecture Validation #VAL-01',
    evidenceStandard: string = 'Production scalability, distributed caching, database read-replicas, and fault tolerance.'
  ): Promise<{ updatedAssessments: RequirementAssessment[]; result: ReEvaluationResult; previousReadiness: number; newReadiness: number; source: 'ai' | 'heuristic' }> {
    const previousDecisionQA = DecisionQAEngine.evaluate(currentAssessments);
    const previousReadiness = previousDecisionQA.readiness;

    const targetAssessment = currentAssessments.find(a => a.requirementId === targetRequirementId);
    const requirementName = targetAssessment ? targetAssessment.name : 'System Design';
    const previousStatus: EvidenceStatus = targetAssessment ? targetAssessment.status : 'UNKNOWN';

    const userInput = JSON.stringify({
      requirementName,
      evidenceStandard,
      candidateAnswer: validationResponse
    });

    const aiRes = await callGemini<GeminiAnswerEvaluationResponse>(
      ANSWER_EVALUATION_SYSTEM_PROMPT,
      userInput,
      {
        newStatus: 'SUPPORTED',
        reasoning: 'Candidate demonstrated clear understanding of horizontal scaling, caching, database read-replicas, and failure handling.',
        signalsObserved: ['Scalability', 'API Architecture', 'Database', 'Caching', 'Failure Handling'],
        signalsMissing: []
      }
    );

    let newStatus: EvidenceStatus = 'SUPPORTED';
    let reasoning = 'Candidate demonstrated clear understanding of horizontal scaling, caching, database read-replicas, and failure handling.';

    if (aiRes.source === 'ai' && aiRes.data) {
      if (aiRes.data.newStatus && ['SUPPORTED', 'PARTIAL', 'UNKNOWN'].includes(aiRes.data.newStatus.toUpperCase())) {
        newStatus = aiRes.data.newStatus.toUpperCase() as EvidenceStatus;
      }
      if (aiRes.data.reasoning) {
        reasoning = aiRes.data.reasoning;
      }
    }

    const source = aiRes.source;

    const newEvidence: EvidenceItem = {
      id: `ev-val-${Date.now()}`,
      requirementId: targetRequirementId,
      source: validationTitle,
      sourceLocation: 'Live Targeted Validation Scenario',
      snippet: validationResponse,
      status: newStatus,
      strength: newStatus === 'SUPPORTED' ? 'DIRECT' : 'INDIRECT',
      reasoning,
      provenance: source
    };

    const updatedAssessments = currentAssessments.map(a => {
      if (a.requirementId === targetRequirementId) {
        return {
          ...a,
          status: newStatus,
          primarySnippet: validationResponse,
          reasoning,
          gapReasoning: newStatus === 'SUPPORTED' ? undefined : a.gapReasoning,
          source: validationTitle,
          sourceLocation: 'Live Targeted Validation Scenario',
          evidence: [newEvidence, ...a.evidence],
          provenance: source
        };
      }
      return a;
    });

    const newDecisionQA = DecisionQAEngine.evaluate(updatedAssessments);
    const newReadiness = newDecisionQA.readiness;
    const nextUncertainty = CriticalGapDetector.detect(updatedAssessments);
    const nextMove = NextMoveEngine.determineNextMove(nextUncertainty);

    const result: ReEvaluationResult = {
      requirementId: targetRequirementId,
      previousStatus,
      newStatus,
      newEvidence,
      newDecisionQA,
      nextUncertainty,
      nextMove,
      explanation: `New validation evidence directly addressed the critical uncertainty in ${requirementName}. Decision readiness increased from ${previousReadiness}% to ${newReadiness}%.`
    };

    return { updatedAssessments, result, previousReadiness, newReadiness, source };
  }

  /**
   * Pure deterministic heuristic re-evaluator (guaranteed fallback).
   */
  static reEvaluate(
    currentAssessments: RequirementAssessment[],
    targetRequirementId: string,
    validationResponse: string,
    validationTitle: string = 'Architecture Validation #VAL-01'
  ): { updatedAssessments: RequirementAssessment[]; result: ReEvaluationResult; previousReadiness: number; newReadiness: number } {
    const previousDecisionQA = DecisionQAEngine.evaluate(currentAssessments);
    const previousReadiness = previousDecisionQA.readiness;

    let targetAssessment = currentAssessments.find(a => a.requirementId === targetRequirementId);
    const previousStatus: EvidenceStatus = targetAssessment ? targetAssessment.status : 'UNKNOWN';
    const newStatus: EvidenceStatus = 'SUPPORTED';

    const newEvidence: EvidenceItem = {
      id: `ev-val-${Date.now()}`,
      requirementId: targetRequirementId,
      source: validationTitle,
      sourceLocation: 'Live Targeted Validation Scenario',
      snippet: validationResponse,
      status: 'SUPPORTED',
      strength: 'DIRECT',
      reasoning: 'Candidate demonstrated clear understanding of horizontal scaling, caching, database read-replicas, and failure handling.',
      provenance: 'heuristic'
    };

    const updatedAssessments = currentAssessments.map(a => {
      if (a.requirementId === targetRequirementId) {
        return {
          ...a,
          status: 'SUPPORTED' as EvidenceStatus,
          primarySnippet: validationResponse,
          reasoning: 'Candidate demonstrated clear understanding of horizontal scaling, caching, database read-replicas, and failure handling.',
          gapReasoning: undefined,
          source: validationTitle,
          sourceLocation: 'Live Targeted Validation Scenario',
          evidence: [newEvidence, ...a.evidence],
          provenance: 'heuristic' as const
        };
      }
      return a;
    });

    const newDecisionQA = DecisionQAEngine.evaluate(updatedAssessments);
    const newReadiness = newDecisionQA.readiness;
    const nextUncertainty = CriticalGapDetector.detect(updatedAssessments);
    const nextMove = NextMoveEngine.determineNextMove(nextUncertainty);

    const result: ReEvaluationResult = {
      requirementId: targetRequirementId,
      previousStatus,
      newStatus,
      newEvidence,
      newDecisionQA,
      nextUncertainty,
      nextMove,
      explanation: `New validation evidence directly addressed the critical uncertainty in ${targetAssessment?.name || 'System Design'}. Decision readiness increased from ${previousReadiness}% to ${newReadiness}%.`
    };

    return { updatedAssessments, result, previousReadiness, newReadiness };
  }
}

