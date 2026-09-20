import React, { useState } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { ReadinessGauge } from '../common/ReadinessGauge';
import { computeLevers, DecisionLever } from '../../services/analysis';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  FlaskConical, 
  Loader2,
  TrendingUp,
  Zap
} from 'lucide-react';

export const DecisionQAScreen: React.FC = () => {
  const { 
    readinessScore, 
    readinessStatus, 
    setCurrentStep,
    primaryValidation,
    currentCriticalUncertainty,
    triggerValidationGeneration,
    isGeneratingValidation,
    requirements
  } = useHireFlow();

  const [humanReviewMarked, setHumanReviewMarked] = useState(false);
  const [evidenceRequested, setEvidenceRequested] = useState(false);

  const isSystemDesignResolved = primaryValidation.evaluated;

  // Convert current requirements to assessments format and compute levers dynamically
  const currentAssessments = requirements.map(r => ({
    requirementId: r.id,
    name: r.name,
    importance: r.importance,
    status: r.status,
    evidence: [],
    primarySnippet: r.snippet || r.evidence,
    reasoning: r.reasoning,
    gapReasoning: r.gapReasoning,
    source: r.source,
    sourceLocation: r.sourceLocation,
    provenance: r.provenance || 'heuristic'
  }));

  const levers: DecisionLever[] = computeLevers(currentAssessments);
  const topActiveLever = levers.find(l => !l.isSupported && l.delta > 0) || levers[0];

  const handleRunValidation = async () => {
    await triggerValidationGeneration();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-12 animate-fade-in">
      {/* Screen Question & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            04 • Decision QA Room
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Do we have enough evidence to decide?
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Evaluating evidentiary readiness to protect the hiring committee from premature conclusions.
          </p>
        </div>

        {isSystemDesignResolved && (
          <button
            onClick={() => setCurrentStep('06_REVIEW')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <span>Proceed to Review</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* HERO SECTION: Animated Circular Readiness Gauge */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs">
        <ReadinessGauge
          score={readinessScore}
          status={readinessStatus}
          showDelta={isSystemDesignResolved}
          delta={22}
        />
      </div>

      {/* FEATURE 1: DECISION LEVER ANALYSIS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900">
              DECISION LEVER ANALYSIS
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Ranked by potential readiness gain (Δ)
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {levers.map((lever) => {
            const isTop = lever.isTopLever && !lever.isSupported;
            const isSupp = lever.isSupported;

            return (
              <div
                key={lever.requirementId}
                className={`p-3.5 rounded-xl border transition-all ${
                  isTop
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : isSupp
                    ? 'bg-slate-50/50 border-slate-200/70 opacity-75'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {/* Left: Requirement Name & Status Transition */}
                  <div className="flex items-center gap-3 min-w-[240px]">
                    <span className={`font-bold text-sm ${isTop ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {lever.requirementName}
                    </span>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      isTop 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isSupp 
                        ? 'bg-slate-100 text-slate-500' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {lever.targetStatusText}
                    </span>
                  </div>

                  {/* Middle & Right: Delta, Visual Bar, and Lever Badge */}
                  <div className="flex items-center gap-4 flex-1 justify-end">
                    {/* Delta Percentage */}
                    <span className={`font-extrabold text-xs w-16 text-right ${
                      isTop ? 'text-emerald-700 font-mono text-sm' : isSupp ? 'text-slate-400' : 'text-slate-700'
                    }`}>
                      {lever.deltaFormatted}
                    </span>

                    {/* Impact Bar */}
                    <div className="w-28 sm:w-40 h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 flex items-center">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : isSupp
                            ? 'bg-transparent'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${lever.barPercentage}%` }}
                      />
                    </div>

                    {/* Status Note or Top Lever Badge */}
                    <div className="w-36 text-right shrink-0">
                      {isTop ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs">
                          ← BIGGEST LEVER
                        </span>
                      ) : isSupp ? (
                        <span className="text-[11px] text-slate-400 italic">
                          no value in re-testing
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          secondary lever
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Muted Caption */}
        <p className="text-xs text-slate-500 italic pt-1 leading-relaxed border-t border-slate-100">
          "This is why the agent selected {topActiveLever?.requirementName || 'System Design'} — it is the maximum-impact unknown, not a guess."
        </p>
      </div>

      {/* CENTRAL UNCERTAINTY SECTION */}
      {!isSystemDesignResolved ? (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-rose-700">
              CRITICAL UNCERTAINTY
            </span>
            <ImportanceBadge importance="Critical" size="sm" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Design</h2>
              <p className="text-xs font-mono text-slate-500 mt-0.5">Core Platform Requirement</p>
            </div>
            <StatusBadge status="UNKNOWN" provenance={currentCriticalUncertainty?.provenance || 'heuristic'} size="md" />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-sans">
            "This does not mean the candidate lacks the skill. It means the current evidence is insufficient."
          </div>
        </div>
      ) : (
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800">
              CRITICAL UNCERTAINTY RESOLVED
            </span>
            <StatusBadge status="SUPPORTED" provenance={primaryValidation.evaluated ? 'ai' : 'heuristic'} size="sm" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Design Verified</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Targeted 5-minute architecture validation verified horizontal scaling, caching, and failover design.
            </p>
          </div>
        </div>
      )}

      {/* NEXT BEST MOVE SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900">
            NEXT BEST MOVE
          </span>
          <span className="text-xs font-mono text-slate-400">Targeted Signal</span>
        </div>

        {!isSystemDesignResolved ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                "Instead of asking ten more questions, HireFlow recommends one focused validation."
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">
                System Design is a critical requirement and currently has insufficient evidence. A single 5-minute architecture scenario directly tests the missing evidence.
              </p>
            </div>

            {/* Scenario Excerpt */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500 block">
                Target Scenario
              </span>
              <p className="text-sm font-semibold text-slate-900">
                "{primaryValidation.scenario}"
              </p>
            </div>

            {/* Evaluation checklist */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 block">
                Evaluation Dimensions
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {['Scalability', 'API Architecture', 'Database', 'Caching', 'Failure Handling'].map((dim) => (
                  <span key={dim} className="px-3 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200/60">
                    {dim}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleRunValidation}
                disabled={isGeneratingValidation}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all disabled:opacity-60"
              >
                {isGeneratingValidation ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-emerald-400" />
                    <span>Preparing Scenario...</span>
                  </>
                ) : (
                  <>
                    <FlaskConical size={14} className="text-emerald-400" />
                    <span>Run 5-minute validation →</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setEvidenceRequested(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {evidenceRequested ? 'Evidence Requested ✓' : 'Request Evidence'}
              </button>

              <button
                onClick={() => setHumanReviewMarked(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {humanReviewMarked ? 'Marked for Review ✓' : 'Mark for Human Review'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-900">
              Critical uncertainty resolved. Readiness is now {readinessScore}% ({readinessStatus}).
            </p>

            <button
              onClick={() => setCurrentStep('06_REVIEW')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all"
            >
              <span>Proceed to Human Review →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
