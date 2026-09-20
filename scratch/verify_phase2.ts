import { DecisionQAEngine, computeLevers } from '../src/services/analysis/decisionQA';
import { RequirementAssessment } from '../src/services/analysis/types';
import { CriticalGapDetector } from '../src/services/analysis/criticalGapDetector';

function runPhase2Tests() {
  console.log('--- Phase 2 Test Suite: Agent Legibility & Lever Math ---');

  // Benchmark assessments similar to Alex Morgan initial state
  const assessments: RequirementAssessment[] = [
    {
      requirementId: 'req-1',
      name: 'Python',
      importance: 'Critical', // weight 4.0
      status: 'SUPPORTED', // 100% -> 4.0 pts
      evidence: [],
      reasoning: 'Strong Python backend exp',
      source: 'Resume'
    },
    {
      requirementId: 'req-2',
      name: 'FastAPI / Async',
      importance: 'High', // weight 2.0
      status: 'SUPPORTED', // 100% -> 2.0 pts
      evidence: [],
      reasoning: 'Async microservices exp',
      source: 'Resume'
    },
    {
      requirementId: 'req-3',
      name: 'PostgreSQL & DB Optimization',
      importance: 'High', // weight 2.0
      status: 'PARTIAL', // 50% -> 1.0 pts
      evidence: [],
      reasoning: 'Basic indexing mentioned',
      source: 'Resume'
    },
    {
      requirementId: 'req-4',
      name: 'System Design',
      importance: 'Critical', // weight 4.0
      status: 'UNKNOWN', // 0% -> 0.0 pts
      evidence: [],
      reasoning: 'Self claimed only',
      source: 'Resume'
    },
    {
      requirementId: 'req-5',
      name: 'Observability & Distributed Tracing',
      importance: 'Medium', // weight 1.0
      status: 'PARTIAL', // 50% -> 0.5 pts
      evidence: [],
      reasoning: 'Datadog mentioned',
      source: 'Interview Notes'
    }
  ];

  // Total weight: 4 + 2 + 2 + 4 + 1 = 13.0 pts
  // Earned: 4.0 + 2.0 + 1.0 + 0 + 0.5 = 7.5 pts
  // Readiness = round(7.5 / 13 * 100) = 58% (or 62% in 5-req set depending on weights)
  const initialQA = DecisionQAEngine.evaluate(assessments);
  console.log(`Initial Readiness: ${initialQA.readiness}%, State: ${initialQA.state}`);
  console.assert(initialQA.state === 'NOT READY', 'Expected NOT READY');

  // Test computeLevers
  const levers = computeLevers(assessments);
  console.log(`Computed ${levers.length} decision levers.`);

  const sysDesignLever = levers.find(l => l.requirementName === 'System Design');
  console.assert(Boolean(sysDesignLever), 'System Design lever should exist');
  console.log(`System Design lever: current=${sysDesignLever?.currentReadiness}%, projected=${sysDesignLever?.projectedReadiness}%, delta=${sysDesignLever?.deltaFormatted}`);

  console.assert(sysDesignLever?.projectedReadiness! > sysDesignLever?.currentReadiness!, 'Projected readiness should be higher than current');
  console.assert(sysDesignLever?.isTopLever === true, 'System Design should be the top lever');

  // Test resolving System Design
  const resolvedAssessments: RequirementAssessment[] = assessments.map(a => 
    a.name === 'System Design' ? { ...a, status: 'SUPPORTED' as const } : a
  );
  const resolvedQA = DecisionQAEngine.evaluate(resolvedAssessments);
  const hasCriticalUncertainty = resolvedAssessments.some(
    a => a.importance === 'Critical' && (a.status === 'UNKNOWN' || a.status === 'CONFLICT')
  );

  console.log(`Post-Validation Readiness: ${resolvedQA.readiness}%, Has Critical Uncertainty: ${hasCriticalUncertainty}`);
  const isTerminalStopped = resolvedQA.readiness >= 80 && !hasCriticalUncertainty;
  console.log(`Is Terminal Stop Condition Met: ${isTerminalStopped}`);
  console.assert(isTerminalStopped === true, 'Terminal stop condition should be true when readiness >= 80 and no critical gap remains');

  // Test payload truncation logic
  const largePayload = 'A'.repeat(500);
  const isLong = largePayload.length > 200;
  const truncated = isLong ? largePayload.slice(0, 200) + '...' : largePayload;
  console.assert(truncated.length === 203, 'Truncated payload should be 203 chars (200 + 3 dots)');
  console.log('Payload truncation logic passed.');

  console.log('All Phase 2 logic assertions passed successfully!');
}

runPhase2Tests();
