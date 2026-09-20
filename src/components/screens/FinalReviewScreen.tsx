import React, { useState } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { DecisionOutcome } from '../../types';
import { 
  Check, 
  ArrowRight, 
  Lock, 
  User, 
  History,
  Sparkles,
  AlertCircle,
  FileQuestion,
  PauseCircle,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';

export const FinalReviewScreen: React.FC = () => {
  const { 
    candidate, 
    role, 
    readinessScore, 
    readinessStatus, 
    requirements, 
    decisionOutcome, 
    confirmDecision, 
    setCurrentStep,
    recruiterName
  } = useHireFlow();

  const [activeDecision, setActiveDecision] = useState<'proceed' | 'request_evidence' | 'hold' | null>(() => {
    if (decisionOutcome === 'PROCEED') return 'proceed';
    if (decisionOutcome === 'REQUEST_MORE_EVIDENCE') return 'request_evidence';
    if (decisionOutcome === 'HOLD_FOR_REVIEW') return 'hold';
    return null;
  });

  const [timestamp, setTimestamp] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const supportedReqs = requirements.filter(r => r.status === 'SUPPORTED');
  const unclearReqs = requirements.filter(r => r.status === 'PARTIAL' || r.status === 'UNKNOWN');

  const handleSelectDecision = (choice: 'proceed' | 'request_evidence' | 'hold') => {
    const currentT = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimestamp(currentT);
    setActiveDecision(choice);

    if (choice === 'proceed') {
      confirmDecision('PROCEED', `Evidence readiness ${readinessScore}%. ${readinessStatus}.`);
    } else if (choice === 'request_evidence') {
      confirmDecision('REQUEST_MORE_EVIDENCE', 'Recruiter requested additional validation before final progression.');
    } else {
      confirmDecision('HOLD_FOR_REVIEW', 'Candidate flagged for full hiring committee debrief.');
    }
  };

  const handleResetDecision = () => {
    setActiveDecision(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-10 animate-fade-in text-slate-900 dark:text-[#F1F5F9]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#2D3748]">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            06 • Decision Briefing
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight font-display">
            What should the human decision-maker know?
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed">
            Consolidated evidence briefing highlighting verified strengths, remaining gaps, and validated deltas.
          </p>
        </div>

        <button
          onClick={() => setCurrentStep('AUDIT_TRAIL')}
          className="flex items-center gap-2 bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-[#F1F5F9] text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all"
        >
          <History size={14} className="text-slate-400 dark:text-slate-500" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* Candidate Dossier Header */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-500/40 text-white dark:text-emerald-400 flex items-center justify-center font-bold text-xl font-mono">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{candidate.name}</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono mt-0.5">{role.title} · Core Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-[#2D3748] pt-4 sm:pt-0 sm:pl-8">
          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 block">Readiness</span>
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{readinessScore}%</span>
          </div>
          <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider ${
            readinessScore >= 80 
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700' 
              : 'bg-slate-900 dark:bg-slate-800 text-white'
          }`}>
            {readinessStatus}
          </span>
        </div>
      </div>

      {/* 3 Core Decision Briefing Sections */}
      <div className="space-y-6">
        {/* 1. WHAT WE KNOW */}
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D3748]">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              WHAT WE KNOW
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{supportedReqs.length} verified criteria</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supportedReqs.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{req.name}</span>
                  <ImportanceBadge importance={req.importance} size="sm" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-[#94A3B8] line-clamp-1">{req.evidence}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. WHAT REMAINS UNCLEAR */}
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2D3748]">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              WHAT REMAINS UNCLEAR
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{unclearReqs.length} unverified or partial</span>
          </div>

          <div className="space-y-2.5">
            {unclearReqs.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#0F1117] text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{req.name}</span>
                    <StatusBadge status={req.status} provenance={req.provenance || 'heuristic'} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#94A3B8]">{req.gapReasoning || req.evidence}</div>
                </div>
                <ImportanceBadge importance={req.importance} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* 3. WHAT CHANGED */}
        <div className="bg-white dark:bg-[#1A1F2E] border border-emerald-200/80 dark:border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-500/20">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
              WHAT CHANGED
            </span>
            <span className="text-xs font-mono text-emerald-800 dark:text-emerald-400 font-bold">+22% Readiness Delta</span>
          </div>

          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            <strong>System Design</strong> transitioned from <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">UNKNOWN</span> to <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-600">SUPPORTED</span>. Targeted 5-minute architecture validation provided concrete, verifiable evidence of horizontal scaling, caching, and failover strategy.
          </p>
        </div>
      </div>

      {/* HUMAN DECISION CONTROLS (FIX 2) */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-8 sm:p-10 shadow-xs space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#2D3748]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              HUMAN DECISION PANEL
            </span>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">Select an executive decision to log into the audit trail</p>
          </div>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Human Agency Enforced</span>
        </div>

        {/* 3 Interactive Buttons with distinct states */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Option 1: Proceed */}
          <button
            type="button"
            onClick={() => handleSelectDecision('proceed')}
            disabled={activeDecision !== null && activeDecision !== 'proceed'}
            className={`p-5 rounded-xl border text-left transition-all relative cursor-pointer ${
              activeDecision === 'proceed'
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-md ring-2 ring-emerald-500/20'
                : activeDecision !== null
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed'
                : 'border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#0F1117] hover:border-emerald-500/80 hover:bg-emerald-50/20 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono">PROCEED</span>
              <CheckCircle2 size={16} className={activeDecision === 'proceed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'} />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Proceed to Next Round</div>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">
              Evidence readiness is sufficient ({readinessScore}%)
            </p>
          </button>

          {/* Option 2: Request More Evidence */}
          <button
            type="button"
            onClick={() => handleSelectDecision('request_evidence')}
            disabled={activeDecision !== null && activeDecision !== 'request_evidence'}
            className={`p-5 rounded-xl border text-left transition-all relative cursor-pointer ${
              activeDecision === 'request_evidence'
                ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 shadow-md ring-2 ring-amber-500/20'
                : activeDecision !== null
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed'
                : 'border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#0F1117] hover:border-amber-500/80 hover:bg-amber-50/20 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono">REQUEST</span>
              <FileQuestion size={16} className={activeDecision === 'request_evidence' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Request More Evidence</div>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">
              Queue targeted competency validation
            </p>
          </button>

          {/* Option 3: Hold for Review */}
          <button
            type="button"
            onClick={() => handleSelectDecision('hold')}
            disabled={activeDecision !== null && activeDecision !== 'hold'}
            className={`p-5 rounded-xl border text-left transition-all relative cursor-pointer ${
              activeDecision === 'hold'
                ? 'border-slate-600 dark:border-slate-500 bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 shadow-md ring-2 ring-slate-400/20'
                : activeDecision !== null
                ? 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed'
                : 'border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#0F1117] hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono">HOLD</span>
              <PauseCircle size={16} className={activeDecision === 'hold' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'} />
            </div>
            <div className="font-bold text-sm text-slate-900 dark:text-white">Hold for Review</div>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-1">
              Flag for hiring committee debrief
            </p>
          </button>
        </div>

        {/* Dynamic Confirmation Cards for each of the 3 states */}
        {activeDecision === 'proceed' && (
          <div className="p-5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Decision Confirmed — Proceeding to Next Round</span>
              </div>
              <button
                onClick={handleResetDecision}
                className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw size={11} />
                Change Selection
              </button>
            </div>
            <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              Evidence readiness: <strong>{readinessScore}%</strong>. All critical requirements evidenced. Human decision maker: <strong>{recruiterName} (Lead Recruiter)</strong>. Timestamp: <span className="font-mono">{timestamp}</span>.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
              ✓ Logged to Immutable Audit Trail
            </div>
          </div>
        )}

        {activeDecision === 'request_evidence' && (
          <div className="p-5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
                <FileQuestion size={16} className="text-amber-600 dark:text-amber-400" />
                <span>Evidence Request Logged</span>
              </div>
              <button
                onClick={handleResetDecision}
                className="text-[11px] font-mono text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw size={11} />
                Change Selection
              </button>
            </div>
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              The recruiter has flagged that additional validation is required before a final decision can be made. Testing Strategy evidence has been queued for review.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-mono text-amber-800 dark:text-amber-400">Flagged requirement:</span>
              <span className="px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-mono font-bold">
                Testing Strategy (Lever Δ +5.4%)
              </span>
            </div>
            <div className="pt-2 text-[11px] font-mono text-amber-700 dark:text-amber-400">
              ✓ Logged to Immutable Audit Trail ({timestamp})
            </div>
          </div>
        )}

        {activeDecision === 'hold' && (
          <div className="p-5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
                <PauseCircle size={16} className="text-slate-600 dark:text-slate-400" />
                <span>Candidate Held for Committee Review</span>
              </div>
              <button
                onClick={handleResetDecision}
                className="text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw size={11} />
                Change Selection
              </button>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              This candidate has been flagged for hiring committee debrief. All evidence, audit trail, and readiness history will be included in the review packet.
            </p>
            <div className="pt-2 text-[11px] font-mono text-slate-600 dark:text-slate-400">
              ✓ Logged to Immutable Audit Trail ({timestamp})
            </div>
          </div>
        )}

        {/* Bottom Note */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-mono">
          <span>Sarah Jenkins (Lead Recruiter & Committee)</span>
          <span>Decision Mode: Human-in-the-Loop</span>
        </div>
      </div>
    </div>
  );
};
