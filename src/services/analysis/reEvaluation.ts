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
If the answer is evasive, generic, or under 30 words, status MUST be UNKNOWN.
If it covers some aspects but misses trade-offs, status MUST be PARTIAL.
If it comprehensively addresses architecture, trade-offs, and resilience, status MUST be SUPPORTED.
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
    validationTitle: string = 'Targeted Validation Scenario',
    evaluationAreas: Array<{ area: string; description: string }> = []
  ): Promise<{
    updatedAssessments: RequirementAssessment[];
    result: ReEvaluationResult;
    previousReadiness: number;
    newReadiness: number;
    source: 'ai' | 'heuristic';
    errorReason?: string;
  }> {
    const previousDecisionQA = DecisionQAEngine.evaluate(currentAssessments);
    const previousReadiness = previousDecisionQA.readiness;

    const targetAssessment = currentAssessments.find(a => a.requirementId === targetRequirementId);
    const requirementName = targetAssessment ? targetAssessment.name : 'Target Competency';
    const previousStatus: EvidenceStatus = targetAssessment ? targetAssessment.status : 'UNKNOWN';

    // 1. Run deterministic heuristic evaluation first as the baseline
    const heuristicEvaluation = ReEvaluationService.gradeAnswerHeuristic(
      validationResponse,
      requirementName,
      evaluationAreas
    );

    const userInput = JSON.stringify({
      requirementName,
      evaluationAreas: evaluationAreas.map(a => `${a.area}: ${a.description}`),
      candidateAnswer: validationResponse
    });

    const aiRes = await callGemini<GeminiAnswerEvaluationResponse>(
      ANSWER_EVALUATION_SYSTEM_PROMPT,
      userInput,
      {
        newStatus: heuristicEvaluation.status,
        reasoning: heuristicEvaluation.reasoning,
        signalsObserved: heuristicEvaluation.signalsObserved,
        signalsMissing: heuristicEvaluation.signalsMissing
      }
    );

    let newStatus: EvidenceStatus = heuristicEvaluation.status;
    let reasoning = heuristicEvaluation.reasoning;
    let source: 'ai' | 'heuristic' = 'heuristic';

    if (aiRes.source === 'ai' && aiRes.data) {
      if (aiRes.data.newStatus && ['SUPPORTED', 'PARTIAL', 'UNKNOWN'].includes(aiRes.data.newStatus.toUpperCase())) {
        newStatus = aiRes.data.newStatus.toUpperCase() as EvidenceStatus;
        source = 'ai';
      }
      if (aiRes.data.reasoning) {
        reasoning = aiRes.data.reasoning;
      }
    }

    // Safety: If the answer is demonstrably trivial or evasive, enforce UNKNOWN regardless of AI hallucination
    const cleanLower = validationResponse.toLowerCase().trim();
    const wordCount = cleanLower.split(/\s+/).filter(Boolean).length;
    const isEvasive = cleanLower.length < 25 || wordCount < 6 ||
      ['i don\'t know', 'no idea', 'not sure', 'unsure', 'n/a', 'skip', 'idk', 'pass'].some(e => cleanLower === e || cleanLower.startsWith(e));

    if (isEvasive) {
      newStatus = 'UNKNOWN';
      reasoning = `Answer provided insufficient technical detail (${wordCount} words). Evidence remains unverified.`;
    }

    const newEvidence: EvidenceItem = {
      id: `ev-val-${Date.now()}`,
      requirementId: targetRequirementId,
      source: validationTitle,
      sourceLocation: 'Live Scenario Validation Response',
      snippet: validationResponse,
      status: newStatus,
      strength: newStatus === 'SUPPORTED' ? 'DIRECT' : newStatus === 'PARTIAL' ? 'INDIRECT' : 'MISSING',
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
          sourceLocation: 'Live Scenario Validation Response',
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
      explanation: newStatus === 'SUPPORTED'
        ? `New validation evidence directly resolved the critical uncertainty in ${requirementName}. Decision readiness shifted from ${previousReadiness}% to ${newReadiness}%.`
        : `Validation response was evaluated as ${newStatus}. Critical uncertainty in ${requirementName} remains unevidenced. Readiness is ${newReadiness}%.`
    };

    return {
      updatedAssessments,
      result,
      previousReadiness,
      newReadiness,
      source,
      errorReason: aiRes.errorReason
    };
  }

  /**
   * Pure deterministic heuristic re-evaluator.
   */
  static reEvaluate(
    currentAssessments: RequirementAssessment[],
    targetRequirementId: string,
    validationResponse: string,
    validationTitle: string = 'Targeted Validation Scenario',
    evaluationAreas: Array<{ area: string; description: string }> = []
  ): { updatedAssessments: RequirementAssessment[]; result: ReEvaluationResult; previousReadiness: number; newReadiness: number } {
    const previousDecisionQA = DecisionQAEngine.evaluate(currentAssessments);
    const previousReadiness = previousDecisionQA.readiness;

    const targetAssessment = currentAssessments.find(a => a.requirementId === targetRequirementId);
    const requirementName = targetAssessment ? targetAssessment.name : 'Target Competency';
    const previousStatus: EvidenceStatus = targetAssessment ? targetAssessment.status : 'UNKNOWN';

    const { status: newStatus, reasoning } = ReEvaluationService.gradeAnswerHeuristic(
      validationResponse,
      requirementName,
      evaluationAreas
    );

    const newEvidence: EvidenceItem = {
      id: `ev-val-${Date.now()}`,
      requirementId: targetRequirementId,
      source: validationTitle,
      sourceLocation: 'Live Scenario Validation Response',
      snippet: validationResponse,
      status: newStatus,
      strength: newStatus === 'SUPPORTED' ? 'DIRECT' : newStatus === 'PARTIAL' ? 'INDIRECT' : 'MISSING',
      reasoning,
      provenance: 'heuristic'
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
          sourceLocation: 'Live Scenario Validation Response',
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
      explanation: newStatus === 'SUPPORTED'
        ? `New validation evidence resolved the critical uncertainty in ${requirementName}. Decision readiness shifted from ${previousReadiness}% to ${newReadiness}%.`
        : `Validation response was evaluated as ${newStatus}. Critical uncertainty in ${requirementName} remains unresolved. Readiness is ${newReadiness}%.`
    };

    return { updatedAssessments, result, previousReadiness, newReadiness };
  }

  /**
   * Deterministic scoring pass: evaluates answer against evaluation areas, word count, and keywords.
   */
  static gradeAnswerHeuristic(
    answer: string,
    requirementName: string,
    evaluationAreas: Array<{ area: string; description: string }> = []
  ): {
    status: EvidenceStatus;
    reasoning: string;
    signalsObserved: string[];
    signalsMissing: string[];
  } {
    const text = answer.trim();
    const textLower = text.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // 1. Check for evasive or extremely short answers (< 30 words or evasive phrases)
    const evasivePhrases = [
      'i don\'t know', 'no idea', 'not sure', 'unsure', 'n/a', 'skip',
      'idk', 'pass', 'i do not know', 'cannot answer', 'no clue', 'haven\'t done this'
    ];
    const isEvasive = evasivePhrases.some(p => textLower === p || textLower.startsWith(p));

    if (isEvasive || wordCount < 15) {
      return {
        status: 'UNKNOWN',
        reasoning: `Candidate provided an evasive or insufficient response (${wordCount} words). The competency remains unevidenced.`,
        signalsObserved: [],
        signalsMissing: evaluationAreas.map(a => a.area)
      };
    }

    if (wordCount < 30) {
      return {
        status: 'UNKNOWN',
        reasoning: `Candidate response was too brief (${wordCount} words) to verify production architectural reasoning or trade-offs.`,
        signalsObserved: words.slice(0, 3),
        signalsMissing: evaluationAreas.map(a => a.area)
      };
    }

    // 2. Score concept coverage across evaluation areas
    const areas = evaluationAreas.length > 0 ? evaluationAreas : [
      { area: 'Scalability', description: 'Horizontal scaling and load balancing' },
      { area: 'Data Storage', description: 'Database design, read replicas, and schema' },
      { area: 'Caching', description: 'Cache layer (Redis/Memcached) and invalidation' },
      { area: 'Resilience', description: 'Circuit breakers, failover, and retry policies' }
    ];

    const observed: string[] = [];
    const missing: string[] = [];

    // Concept dictionary
    const conceptKeywords: Record<string, string[]> = {
      'Scalability': ['scale', 'scaling', 'horizontal', 'load balancer', 'stateless', 'alb', 'nginx', 'traffic', 'cluster'],
      'API Architecture': ['api', 'rest', 'gateway', 'endpoint', 'rate limit', 'payload', 'grpc', 'contract'],
      'Database Decisions': ['database', 'postgres', 'postgresql', 'sql', 'read-replica', 'replica', 'sharding', 'acid', 'migration', 'queries'],
      'Caching Strategy': ['cache', 'caching', 'redis', 'memcached', 'cache-aside', 'ttl', 'invalidation'],
      'Failure Handling': ['failure', 'failover', 'circuit breaker', 'retry', 'degradation', 'graceful', 'sqs', 'queue', 'fallback'],
      'Unit vs Integration Ratio': ['unit', 'integration', 'pyramid', 'coverage', 'mock'],
      'Mocking & Fixtures': ['mock', 'fixture', 'stub', 'simulator'],
      'Production Context': ['production', 'real-world', 'system', 'deployed', 'workload'],
      'Trade-off Analysis': ['trade-off', 'tradeoff', 'latency', 'cost', 'consistency', 'decision']
    };

    for (const item of areas) {
      const keywords = conceptKeywords[item.area] || item.area.toLowerCase().split(/\s+/);
      const matches = keywords.some(k => textLower.includes(k));
      if (matches) {
        observed.push(item.area);
      } else {
        missing.push(item.area);
      }
    }

    const coverageRatio = areas.length > 0 ? observed.length / areas.length : 0;

    // Check depth signals: trade-offs, metrics, architecture terms
    const hasArchitectureDepth = /\b(stateless|load balancer|redis|postgres|read-replica|circuit breaker|asynchronous|queue|throughput|latency|p99)\b/i.test(text);

    if (coverageRatio >= 0.7 && wordCount >= 40 && hasArchitectureDepth) {
      return {
        status: 'SUPPORTED',
        reasoning: `Comprehensive response (${wordCount} words) covering ${observed.length}/${areas.length} core dimensions including ${observed.slice(0, 3).join(', ')}.`,
        signalsObserved: observed,
        signalsMissing: missing
      };
    } else if (coverageRatio >= 0.35 || wordCount >= 30) {
      return {
        status: 'PARTIAL',
        reasoning: `Partial coverage (${observed.length}/${areas.length} dimensions). Demonstrates basic knowledge of ${observed.length > 0 ? observed.join(', ') : 'concepts'}, but lacks depth in ${missing.length > 0 ? missing.slice(0, 2).join(', ') : 'failure handling'}.`,
        signalsObserved: observed,
        signalsMissing: missing
      };
    } else {
      return {
        status: 'UNKNOWN',
        reasoning: `Insufficient coverage (${observed.length}/${areas.length} dimensions). Does not address required evaluation standards for ${requirementName}.`,
        signalsObserved: observed,
        signalsMissing: missing
      };
    }
  }
}
