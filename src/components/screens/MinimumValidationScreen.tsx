import React, { useState, useEffect } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { computeLevers } from '../../services/analysis';
import { 
  FlaskConical, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  Trash2,
  RefreshCw,
  TrendingUp,
  FileText,
  Gauge
} from 'lucide-react';

const AGENT_SEQUENCE = [
  'OBSERVING EVIDENCE',
  'IDENTIFYING UNCERTAINTY',
  'SELECTING NEXT MOVE',
  'EVALUATING EVIDENCE DIMENSIONS',
  'RECALCULATING DECISION READINESS'
];

export const MinimumValidationScreen: React.FC = () => {
  const { 
    primaryValidation, 
    evaluateValidation, 
    isEvaluatingValidation, 
    readinessScore, 
    readinessStatus, 
    setCurrentStep,
    currentCriticalUncertainty,
    currentNextMove,
    requirements
  } = useHireFlow();

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

  const levers = computeLevers(currentAssessments);
  const topActiveLever = levers.find(l => !l.isSupported && l.delta > 0) || levers[0];
  const topDelta = topActiveLever?.delta || 21.6;

  const validationOptions = [
    {
      name: "5-min targeted scenario",
      timeDisplay: "5 min",
      timeCostMinutes: 5,
      deltaFormatted: `+${topDelta.toFixed(1)}%`,
      roi: (topDelta / 5).toFixed(2),
      isSelected: true,
      reason: null
    },
    {
      name: "20-min pair programming",
      timeDisplay: "20 min",
      timeCostMinutes: 20,
      deltaFormatted: `+${topDelta.toFixed(1)}%`,
      roi: (topDelta / 20).toFixed(2),
      isSelected: false,
      reason: "same evidence gain, 4x the time"
    },
    {
      name: "45-min system design panel",
      timeDisplay: "45 min",
      timeCostMinutes: 45,
      deltaFormatted: `+${topDelta.toFixed(1)}%`,
      roi: (topDelta / 45).toFixed(2),
      isSelected: false,
      reason: "same evidence gain, 9x the time"
    },
    {
      name: "Reference check",
      timeDisplay: "2 days",
      timeCostMinutes: 2880,
      deltaFormatted: "+5.4%",
      roi: "0.003",
      isSelected: false,
      reason: "lower gain"
    }
  ];

  const [responseText, setResponseText] = useState(primaryValidation.candidateResponse);
  const [sequenceIndex, setSequenceIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isEvaluatingValidation) {
      setSequenceIndex(0);
      interval = setInterval(() => {
        setSequenceIndex(prev => {
          if (prev < AGENT_SEQUENCE.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 250);
    } else {
      setSequenceIndex(0);
    }
    return () => clearInterval(interval);
  }, [isEvaluatingValidation]);

  const handleEvaluate = async () => {
    await evaluateValidation(primaryValidation.id, responseText);
  };

  const isPrimaryEvaluated = primaryValidation.evaluated;

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            05 • Targeted Validation
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            What should we validate?
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            The smallest targeted scenario to resolve the critical uncertainty in System Design.
          </p>
        </div>

        {isPrimaryEvaluated && (
          <button
            onClick={() => setCurrentStep('06_REVIEW')}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <span>Continue to Review</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* FEATURE 2: EVIDENCE ROI TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-emerald-600" />
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900">
              EVIDENCE ROI COMPARISON
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Efficiency = Δ Readiness ÷ Time Cost
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 px-3 font-semibold">Option</th>
                <th className="pb-3 px-3 font-semibold">Time</th>
                <th className="pb-3 px-3 font-semibold">Δ Readiness</th>
                <th className="pb-3 px-3 font-semibold text-right">ROI (%/min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {validationOptions.map((opt) => (
                <tr
                  key={opt.name}
                  className={`transition-colors ${
                    opt.isSelected
                      ? 'bg-emerald-50/80 text-emerald-950 font-bold'
                      : 'text-slate-500 hover:bg-slate-50/60 opacity-80'
                  }`}
                >
                  <td className="py-3 px-3 rounded-l-lg">
                    <div className="flex items-center gap-2">
                      <span className={opt.isSelected ? 'text-emerald-950 font-bold' : 'text-slate-700'}>
                        {opt.name}
                      </span>
                      {opt.isSelected && (
                        <span className="text-emerald-600 text-xs font-bold">★</span>
                      )}
                      {opt.reason && (
                        <span className="text-[10px] text-slate-400 font-normal italic ml-1">
                          — {opt.reason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {opt.timeDisplay}
                  </td>
                  <td className={`py-3 px-3 ${opt.isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-700'}`}>
                    {opt.deltaFormatted}
                  </td>
                  <td className={`py-3 px-3 text-right rounded-r-lg ${opt.isSelected ? 'text-emerald-700 font-extrabold text-sm' : 'text-slate-500'}`}>
                    {opt.roi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600 italic pt-2 leading-relaxed border-t border-slate-100 font-sans">
          "Don't ask ten more questions. Ask the smallest question that resolves the biggest uncertainty."
        </p>
      </div>

      {/* Validation Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
              VALIDATION TARGET
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              System Design
            </h2>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-100 text-slate-700 font-medium">
            5 minute validation
          </span>
        </div>

        {/* Scenario Prompt */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 block">
            Scenario
          </span>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed font-sans">
            "{primaryValidation.scenario}"
          </div>
        </div>

        {/* Evaluation Dimensions */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 block">
            Evaluation Dimensions
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {['Scalability', 'API Architecture', 'Database Decisions', 'Caching', 'Failure Handling'].map((item) => (
              <span key={item} className="px-3 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200/60 flex items-center gap-1.5">
                <Check size={12} className={isPrimaryEvaluated ? "text-emerald-600" : "text-slate-400"} />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Candidate Response Area */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500">
              Candidate Response
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setResponseText(primaryValidation.defaultResponse)}
                className="text-slate-500 hover:text-slate-900 underline"
              >
                Restore Demo Text
              </button>
              <button
                type="button"
                onClick={() => setResponseText('')}
                className="text-rose-600 hover:text-rose-800 underline flex items-center gap-1"
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            disabled={isEvaluatingValidation}
            className="w-full p-4 text-xs font-mono text-slate-900 bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed disabled:opacity-70"
            placeholder="Candidate response..."
          />
        </div>

        {/* Evaluation Execution State */}
        {isEvaluatingValidation ? (
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <Loader2 size={14} className="animate-spin" />
                AI Agent Evaluating Evidence
              </span>
              <span>Step {sequenceIndex + 1} of {AGENT_SEQUENCE.length}</span>
            </div>

            <div className="space-y-1">
              {AGENT_SEQUENCE.map((step, idx) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 ${
                    idx < sequenceIndex
                      ? 'text-emerald-400'
                      : idx === sequenceIndex
                      ? 'text-white font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={handleEvaluate}
              disabled={!responseText.trim() || isEvaluatingValidation}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles size={14} className="text-emerald-400" />
              <span>{isPrimaryEvaluated ? 'Re-Evaluate Evidence →' : 'Evaluate Evidence →'}</span>
            </button>
          </div>
        )}
      </div>

      {/* RE-EVALUATION MOMENT: Major Full-Width Transition Section */}
      {isPrimaryEvaluated && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs space-y-8 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-600" />
              RE-EVALUATION MOMENT
            </span>
            <span className="text-xs font-mono text-slate-400">Evidence Linchpin</span>
          </div>

          {/* Full-width Before / New Evidence / After Progression */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
            {/* BEFORE */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                  BEFORE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold" title="deterministic engine">
                  RULE
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">System Design</div>
              <div className="text-xs font-mono text-slate-500">UNKNOWN</div>
              <div className="text-2xl font-extrabold font-mono text-slate-800 pt-1">62%</div>
              <div className="text-[11px] font-mono font-bold text-amber-800">NOT READY</div>
            </div>

            {/* NEW EVIDENCE CONNECTOR */}
            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 block">
                NEW EVIDENCE
              </span>
              <div className="text-sm font-bold text-emerald-950">Architecture Validation</div>
              <p className="text-xs text-emerald-800 pt-1 leading-tight">
                Verified horizontal scaling, Redis caching, read-replicas, and circuit breakers.
              </p>
            </div>

            {/* AFTER */}
            <div className="p-5 rounded-xl bg-slate-900 text-white space-y-1.5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 block">
                  AFTER
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +22% DELTA
                </span>
              </div>
              <div className="text-sm font-bold text-white">System Design</div>
              <div className="text-xs font-mono text-emerald-400">SUPPORTED</div>
              <div className="text-2xl font-extrabold font-mono text-white pt-1">84%</div>
              <div className="text-[11px] font-mono font-bold text-emerald-400">READY FOR HUMAN REVIEW</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 italic leading-relaxed text-center">
            "New evidence directly addressed the critical uncertainty."
          </p>

          {/* NEXT UNCERTAINTY */}
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900">
                NEXT UNCERTAINTY
              </span>
              <StatusBadge status={currentCriticalUncertainty?.status || 'UNKNOWN'} provenance={currentCriticalUncertainty?.provenance || 'heuristic'} size="sm" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{currentCriticalUncertainty?.name || 'Testing'}</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                "Testing remains insufficiently evidenced."
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500">Next suggested action:</span>
              <span className="font-bold text-slate-900">Run focused testing validation</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep('06_REVIEW')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all"
            >
              <span>Proceed to Human Review →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
