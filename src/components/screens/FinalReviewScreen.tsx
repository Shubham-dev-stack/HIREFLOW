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
  AlertCircle
} from 'lucide-react';

export const FinalReviewScreen: React.FC = () => {
  const { 
    candidate, 
    role, 
    readinessScore, 
    readinessStatus, 
    requirements, 
    decisionOutcome, 
    decisionNotes, 
    isDecisionConfirmed, 
    confirmDecision, 
    setCurrentStep 
  } = useHireFlow();

  const [selectedOutcome, setSelectedOutcome] = useState<DecisionOutcome>(
    decisionOutcome || 'PROCEED'
  );
  const [notes, setNotes] = useState(
    decisionNotes || 'System Design uncertainty has been verified via targeted architecture validation. Testing mindset can be briefly verified during final team chat.'
  );

  const supportedReqs = requirements.filter(r => r.status === 'SUPPORTED');
  const unclearReqs = requirements.filter(r => r.status === 'PARTIAL' || r.status === 'UNKNOWN');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    confirmDecision(selectedOutcome, notes);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            06 • Decision Briefing
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            What should the human decision-maker know?
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Consolidated evidence briefing highlighting verified strengths, remaining gaps, and validated deltas.
          </p>
        </div>

        <button
          onClick={() => setCurrentStep('AUDIT_TRAIL')}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-all"
        >
          <History size={14} className="text-slate-400" />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* Candidate Dossier Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{candidate.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{role.title} · Core Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-8">
          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 block">Readiness</span>
            <span className="text-3xl font-extrabold font-mono text-slate-900">{readinessScore}%</span>
          </div>
          <span className="px-3 py-1 rounded bg-slate-900 text-white text-xs font-mono font-bold uppercase tracking-wider">
            {readinessStatus}
          </span>
        </div>
      </div>

      {/* 3 Core Decision Briefing Sections */}
      <div className="space-y-6">
        {/* 1. WHAT WE KNOW */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              WHAT WE KNOW
            </span>
            <span className="text-xs font-mono text-slate-400">{supportedReqs.length} verified criteria</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supportedReqs.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{req.name}</span>
                  <ImportanceBadge importance={req.importance} size="sm" />
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">{req.evidence}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. WHAT REMAINS UNCLEAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              WHAT REMAINS UNCLEAR
            </span>
            <span className="text-xs font-mono text-slate-400">{unclearReqs.length} unverified or partial</span>
          </div>

          <div className="space-y-2.5">
            {unclearReqs.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{req.name}</span>
                    <StatusBadge status={req.status} provenance={req.provenance || 'heuristic'} size="sm" />
                  </div>
                  <div className="text-[11px] text-slate-500">{req.gapReasoning || req.evidence}</div>
                </div>
                <ImportanceBadge importance={req.importance} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* 3. WHAT CHANGED */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-900 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-600" />
              WHAT CHANGED
            </span>
            <span className="text-xs font-mono text-emerald-800">Targeted Delta</span>
          </div>

          <p className="text-sm text-slate-800 leading-relaxed font-sans">
            <strong>System Design</strong> changed from <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">UNKNOWN</span> to <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">SUPPORTED</span>. Architecture validation provided concrete, verifiable evidence of horizontal scaling and failover strategy.
          </p>
        </div>
      </div>

      {/* HUMAN DECISION CONTROLS */}
      <form onSubmit={handleConfirm} className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900">
            HUMAN DECISION
          </span>
          <span className="text-xs font-mono text-slate-400">Human Finality</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'PROCEED' as DecisionOutcome, label: 'Proceed to Next Round', note: 'Evidence sufficient for advance' },
            { id: 'REQUEST_MORE_EVIDENCE' as DecisionOutcome, label: 'Request More Evidence', note: 'Run testing validation' },
            { id: 'HOLD_FOR_REVIEW' as DecisionOutcome, label: 'Hold for Review', note: 'Flag for committee debrief' }
          ].map((opt) => (
            <label
              key={opt.id}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedOutcome === opt.id
                  ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="decision"
                  value={opt.id}
                  checked={selectedOutcome === opt.id}
                  onChange={() => setSelectedOutcome(opt.id)}
                  className="sr-only"
                />
                <span className="text-xs font-bold">{opt.label}</span>
              </div>
              <p className={`text-[11px] mt-1 ${selectedOutcome === opt.id ? 'text-slate-300' : 'text-slate-500'}`}>
                {opt.note}
              </p>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-medium">
            Human Rationale Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed font-sans"
            placeholder="Record decision reasoning..."
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-slate-400 italic">
            Final hiring decisions always remain with human decision-makers.
          </p>

          <button
            type="submit"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all"
          >
            <Lock size={13} className="text-emerald-400" />
            <span>{isDecisionConfirmed ? 'Decision Recorded (Update)' : 'Confirm Decision'}</span>
          </button>
        </div>

        {isDecisionConfirmed && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-950 text-xs text-center font-medium border border-emerald-200">
            ✓ Decision recorded to immutable Audit Trail.
          </div>
        )}
      </form>
    </div>
  );
};
