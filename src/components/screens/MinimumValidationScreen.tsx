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
  Gauge,
  AlertTriangle,
  Layers,
  Cpu,
  User
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
    candidate,
    hasEvidenceBeenBuilt,
    buildEvidenceMap,
    isBuildingEvidence,
    primaryValidation, 
    evaluateValidation, 
    isEvaluatingValidation, 
    readinessScore, 
    readinessStatus, 
    setCurrentStep,
    currentCriticalUncertainty,
    currentNextMove,
    requirements,
    isAiActive,
    lastReEvaluationResult
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

  if (!hasEvidenceBeenBuilt) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-8 space-y-8 animate-fade-in text-slate-900 dark:text-[#F1F5F9]">
        {/* Active Candidate Banner */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-[#2D3748]">
          <User size={13} className="text-emerald-500" />
          <span>Evaluating candidate: <strong className="text-slate-900 dark:text-white font-bold">{candidate.name}</strong></span>
        </div>

        {/* Empty State Card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-[#1A1F2E] border border-amber-500/40 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <Clock size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Evidence not yet built for {candidate.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Targeted validation scenarios require indexed evidence to identify the critical gaps and next moves. Please build the evidence map first.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentStep('02_CANDIDATES')}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#2D3748] text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Candidate Intake
            </button>
            <button
              onClick={buildEvidenceMap}
              disabled={isBuildingEvidence || candidate.documents.length === 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isBuildingEvidence ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Building Evidence Map...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Build Evidence Map</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-12 animate-fade-in text-slate-900 dark:text-[#F1F5F9]">
      {/* Active Candidate Banner */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-[#2D3748]/60 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <User size={13} className="text-emerald-500" />
          <span>Evaluating candidate: <strong className="text-slate-900 dark:text-white font-bold">{candidate.name}</strong></span>
        </div>
        <button
          onClick={() => setCurrentStep('03_EVIDENCE')}
          className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          View Evidence Matrix →
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#2D3748]">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            05 • Targeted Validation
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What should we validate?
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed">
            The smallest targeted scenario to resolve the critical uncertainty in System Design.
          </p>
        </div>

        {isPrimaryEvaluated && (
          <button
            onClick={() => setCurrentStep('06_REVIEW')}
            className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <span>Continue to Review</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* FEATURE 2: EVIDENCE ROI TABLE */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-8 shadow-xs space-y-5 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D3748]">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              EVIDENCE ROI COMPARISON
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
            Efficiency = Δ Readiness ÷ Time Cost
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#2D3748] text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="pb-3 px-3 font-semibold">Option</th>
                <th className="pb-3 px-3 font-semibold">Time</th>
                <th className="pb-3 px-3 font-semibold">Δ Readiness</th>
                <th className="pb-3 px-3 font-semibold text-right">ROI (%/min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2D3748]">
              {validationOptions.map((opt) => (
                <tr
                  key={opt.name}
                  className={`transition-colors ${
                    opt.isSelected
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 opacity-80'
                  }`}
                >
                  <td className="py-3 px-3 rounded-l-lg">
                    <div className="flex items-center gap-2">
                      <span className={opt.isSelected ? 'text-emerald-950 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {opt.name}
                      </span>
                      {opt.isSelected && (
                        <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">★</span>
                      )}
                      {opt.reason && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal italic ml-1">
                          — {opt.reason}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {opt.timeDisplay}
                  </td>
                  <td className={`py-3 px-3 ${opt.isSelected ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {opt.deltaFormatted}
                  </td>
                  <td className={`py-3 px-3 text-right rounded-r-lg ${opt.isSelected ? 'text-emerald-700 dark:text-emerald-400 font-extrabold text-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                    {opt.roi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600 dark:text-[#94A3B8] italic pt-2 leading-relaxed border-t border-slate-100 dark:border-[#2D3748] font-sans">
          "Don't ask ten more questions. Ask the smallest question that resolves the biggest uncertainty."
        </p>
      </div>

      {/* Validation Header Card */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-8 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D3748]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              VALIDATION TARGET
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              System Design
            </h2>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            5 minute validation
          </span>
        </div>

        {/* Scenario Prompt */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
            Scenario
          </span>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] text-sm font-semibold text-slate-900 dark:text-white leading-relaxed font-sans">
            "{primaryValidation.scenario}"
          </div>
        </div>

        {/* Evaluation Dimensions */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
            Evaluation Dimensions
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {['Scalability', 'API Architecture', 'Database Decisions', 'Caching', 'Failure Handling'].map((item) => (
              <span key={item} className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 flex items-center gap-1.5">
                <Check size={12} className={isPrimaryEvaluated ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Candidate Response Area */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#2D3748]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              Candidate Response
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setResponseText(primaryValidation.defaultResponse)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
              >
                Restore Demo Text
              </button>
              <button
                type="button"
                onClick={() => setResponseText('')}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-800 underline flex items-center gap-1"
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
            className="w-full p-4 text-xs font-mono text-slate-900 dark:text-slate-100 bg-slate-50/60 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500 leading-relaxed disabled:opacity-70"
            placeholder="Candidate response..."
          />
        </div>

        {/* Evaluation Execution State */}
        {isEvaluatingValidation ? (
          <div className="p-4 rounded-xl bg-slate-900 dark:bg-[#07090C] text-white space-y-3 font-mono text-xs border border-slate-800">
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
              className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles size={14} className="text-emerald-400 dark:text-slate-950" />
              <span>{isPrimaryEvaluated ? 'Re-Evaluate Evidence →' : 'Evaluate Evidence →'}</span>
            </button>
          </div>
        )}
      </div>

      {/* FIX 5C: AI EVALUATION BREAKDOWN CARD */}
      {isPrimaryEvaluated && (
        <div className="bg-white dark:bg-[#1A1F2E] border border-emerald-500/40 rounded-2xl p-8 shadow-xs space-y-6 animate-fade-in transition-colors">
          <div className="flex items-center justify-between pb-3 border-emerald-100 dark:border-emerald-500/20 border-b">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
                EVALUATION BREAKDOWN
              </span>
            </div>

            {/* Source Badge: AI (emerald) or RULE (slate) */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                isAiActive 
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}>
                SOURCE: {isAiActive ? 'AI (GEMINI)' : 'RULE (DETERMINISTIC)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Signals Observed (Green checkmarks) */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
              <span className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
                ✓ SIGNALS OBSERVED (CORROBORATED)
              </span>
              <ul className="space-y-2 text-xs font-mono text-emerald-950 dark:text-emerald-200">
                {lastReEvaluationResult?.signalsObserved && lastReEvaluationResult.signalsObserved.length > 0 ? (
                  lastReEvaluationResult.signalsObserved.map((sig, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 text-slate-500">
                    <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Technical architecture signals addressed in submission</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 2: Signals Missing / Potential Follow-ups (Amber warnings) */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
              <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                ⚠ SIGNALS MISSING / POTENTIAL FOLLOW-UPS
              </span>
              <ul className="space-y-2 text-xs font-mono text-amber-950 dark:text-amber-200">
                {lastReEvaluationResult?.signalsMissing && lastReEvaluationResult.signalsMissing.length > 0 ? (
                  lastReEvaluationResult.signalsMissing.map((sig, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>{sig}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 text-slate-500">
                    <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>No critical omissions detected</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* New Status with Reasoning */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                STATUS TRANSITION: {lastReEvaluationResult?.previousStatus || 'UNKNOWN'} → {lastReEvaluationResult?.newStatus || 'SUPPORTED'}
              </span>
              <StatusBadge status={lastReEvaluationResult?.newStatus || 'SUPPORTED'} provenance={isAiActive ? 'ai' : 'heuristic'} size="sm" />
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
              <strong>Reasoning:</strong> {primaryValidation.resultReasoning || lastReEvaluationResult?.explanation || 'Evaluated against evidence threshold standard.'}
            </p>
          </div>
        </div>
      )}

      {/* RE-EVALUATION MOMENT: Major Full-Width Transition Section */}
      {isPrimaryEvaluated && (
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-8 sm:p-10 shadow-xs space-y-8 animate-fade-in transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#2D3748]">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
              RE-EVALUATION MOMENT
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Evidence Linchpin</span>
          </div>

          {/* Full-width Before / New Evidence / After Progression */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
            {/* BEFORE */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block">
                  BEFORE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold" title="deterministic engine">
                  RULE
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{lastReEvaluationResult?.requirementName || primaryValidation.requirementName}</div>
              <div className="text-xs font-mono text-slate-500">{lastReEvaluationResult?.previousStatus || 'UNKNOWN'}</div>
              <div className="text-2xl font-extrabold font-mono text-slate-800 dark:text-slate-200 pt-1">
                {lastReEvaluationResult ? `${lastReEvaluationResult.previousReadiness}%` : `${readinessScore}%`}
              </div>
              <div className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400">
                {lastReEvaluationResult && lastReEvaluationResult.previousReadiness >= 80 ? 'READY FOR REVIEW' : 'NOT READY'}
              </div>
            </div>

            {/* NEW EVIDENCE CONNECTOR */}
            <div className="p-5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5 text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-400 block">
                NEW EVIDENCE
              </span>
              <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200">{primaryValidation.title}</div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 pt-1 leading-tight line-clamp-3">
                {primaryValidation.resultEvidence || primaryValidation.candidateResponse}
              </p>
            </div>

            {/* AFTER */}
            <div className="p-5 rounded-xl bg-slate-900 dark:bg-[#07090C] text-white space-y-1.5 shadow-sm relative overflow-hidden border border-slate-800 dark:border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 block">
                  AFTER
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +{lastReEvaluationResult?.delta ?? 0}% DELTA
                </span>
              </div>
              <div className="text-sm font-bold text-white">{lastReEvaluationResult?.requirementName || primaryValidation.requirementName}</div>
              <div className="text-xs font-mono text-emerald-400">{lastReEvaluationResult?.newStatus || 'SUPPORTED'}</div>
              <div className="text-2xl font-extrabold font-mono text-white pt-1">{readinessScore}%</div>
              <div className="text-[11px] font-mono font-bold text-emerald-400">{readinessStatus}</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-[#94A3B8] italic leading-relaxed text-center">
            "{lastReEvaluationResult?.explanation || 'New evidence evaluated against decision threshold.'}"
          </p>

          {/* NEXT UNCERTAINTY */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-[#2D3748] bg-slate-50/70 dark:bg-[#0F1117] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
                NEXT UNCERTAINTY
              </span>
              <StatusBadge status={currentCriticalUncertainty?.status || 'UNKNOWN'} provenance={currentCriticalUncertainty?.provenance || 'heuristic'} size="sm" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentCriticalUncertainty?.name || 'All Core Competencies Evidenced'}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {currentCriticalUncertainty ? 'Next priority competency requiring evidence verification.' : 'No further critical uncertainties detected.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-[#2D3748] flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500 dark:text-slate-400">Next suggested action:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currentCriticalUncertainty ? `Run focused ${currentCriticalUncertainty.name} validation` : 'Proceed to Human Review'}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep('06_REVIEW')}
              className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all"
            >
              <span>Proceed to Human Review →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
