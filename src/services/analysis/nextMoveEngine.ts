import { RequirementAssessment, NextMoveResult } from './types';

export class NextMoveEngine {
  /**
   * Generates the smallest targeted validation to resolve the primary critical uncertainty.
   * Principle: "Do not ask ten more questions. Ask the smallest question that resolves the biggest uncertainty."
   */
  static determineNextMove(uncertainty: RequirementAssessment | null): NextMoveResult {
    if (!uncertainty) {
      return {
        requirementId: 'all-resolved',
        requirementName: 'Full Coverage',
        action: 'Proceed to Human Review',
        reason: 'All critical evidence dimensions have reached sufficient verification.',
        estimatedTime: '0 minutes',
        validationType: 'COMMITTEE_REVIEW',
        scenario: 'Review consolidated evidence brief and record final human decision.',
        evaluationAreas: []
      };
    }

    const nameLower = uncertainty.name.toLowerCase();

    // System Design / Architecture (Primary Benchmark)
    if (nameLower.includes('system design') || nameLower.includes('architecture')) {
      return {
        requirementId: uncertainty.requirementId,
        requirementName: uncertainty.name,
        action: 'Run a focused architecture validation',
        reason: `${uncertainty.name} is a critical requirement and currently has insufficient evidence. A focused architecture scenario can directly test the missing evidence.`,
        estimatedTime: '5 minutes',
        validationType: 'SYSTEM_DESIGN_SCENARIO',
        scenario: 'Design a backend architecture for a service handling approximately 1 million daily requests with high read-to-write ratios, strict latency requirements (p99 < 80ms), and automated failover.',
        evaluationAreas: [
          {
            area: 'Scalability',
            description: 'Horizontal scaling of stateless application nodes behind balanced reverse proxies.'
          },
          {
            area: 'API Architecture',
            description: 'Clean separation of public API gateways and internal service boundaries.'
          },
          {
            area: 'Database Decisions',
            description: 'Relational persistence with read-replicas, connection pooling, and transactional integrity.'
          },
          {
            area: 'Caching Strategy',
            description: 'Multi-tier caching (Redis/In-memory) with write-through or cache-aside invalidation.'
          },
          {
            area: 'Failure Handling',
            description: 'Circuit breakers, graceful degradation, and retry queues with exponential backoff.'
          }
        ]
      };
    }

    // Testing Strategy
    if (nameLower.includes('testing') || nameLower.includes('quality')) {
      return {
        requirementId: uncertainty.requirementId,
        requirementName: uncertainty.name,
        action: 'Run a focused testing strategy validation',
        reason: `${uncertainty.name} has unverified testing discipline. A 4-minute targeted scenario verifies production reliability mindset.`,
        estimatedTime: '4 minutes',
        validationType: 'TESTING_STRATEGY_CHECK',
        scenario: 'Describe how you would design an automated testing strategy for a payment processing and ledger update API to prevent regressions and handle transient third-party payment gateway outages.',
        evaluationAreas: [
          {
            area: 'Unit vs Integration Ratio',
            description: 'Layered test pyramid separating pure business logic from external I/O.'
          },
          {
            area: 'Mocking & Fixtures',
            description: 'Deterministic mocking of third-party payment provider webhooks and HTTP calls.'
          },
          {
            area: 'Contract Testing',
            description: 'Schema verification using consumer-driven contract tests.'
          },
          {
            area: 'Load & Concurrency Tests',
            description: 'Race condition verification on ledger balance mutations using concurrent test runners.'
          }
        ]
      };
    }

    // Generic fallback for any other custom requirement
    return {
      requirementId: uncertainty.requirementId,
      requirementName: uncertainty.name,
      action: `Run focused ${uncertainty.name} validation`,
      reason: `${uncertainty.name} currently lacks sufficient evidence. A concise practical scenario directly tests the missing competency.`,
      estimatedTime: '5 minutes',
      validationType: 'TARGETED_SCENARIO',
      scenario: `Provide a specific real-world example of how you implemented and resolved trade-offs involving ${uncertainty.name} in a production environment.`,
      evaluationAreas: [
        {
          area: 'Production Context',
          description: 'Concrete implementation in a real-world system.'
        },
        {
          area: 'Trade-off Analysis',
          description: 'Explicit justification for technical decisions made.'
        }
      ]
    };
  }
}
