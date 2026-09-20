import React, { useState } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { ReadinessGauge } from '../common/ReadinessGauge';
import { computeLevers, DecisionLever, DecisionQAEngine } from '../../services/analysis';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  FlaskConical, 
  Loader2,
  TrendingUp,
  Zap,
  HelpCircle,
  X,
  Info,
  Layers,
  ArrowDown
} from 'lucide-react';
import { EvidenceStatus } from '../../types';
import { User, Clock } from 'lucide-react';

export const DecisionQAScreen: React.FC = () => {
  const { 
    candidate,
    hasEvidenceBeenBuilt,
    buildEvidenceMap,
    isBuildingEvidence,
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
  const [showWhyGapPopover, setShowWhyGapPopover] = useState(false);
  const [hoveredRequirementId, setHoveredRequirementId] = useState<string | null>(null);

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
    conflictSnippets: r.conflictSnippets,
    provenance: r.provenance || 'heuristic'
  }));

  const levers: DecisionLever[] = computeLevers(currentAssessments);
  const unresolvedLevers = levers.filter(l => l.currentStatus !== 'SUPPORTED');

  // Terminal stop condition: readinessScore >= 80 AND no remaining critical uncertainty
  const hasCriticalUncertainty = requirements.some(
    r => r.importance === 'Critical' && (r.status === 'UNKNOWN' || r.status === 'CONFLICT')
  );
  const isTerminalStopped = readinessScore >= 80 && !hasCriticalUncertainty;

  // Calculate total weight and earned weight across requirements for the stacked bar
  let totalWeight = 0;
  let earnedWeight = 0;

  requirements.forEach(r => {
    const w = DecisionQAEngine.getImportanceWeight(r.importance);
    totalWeight += w;
    const c = DecisionQAEngine.getStatusContribution(r.status);
    earnedWeight += w * c;
  });

  const handleRunValidation = async () => {
    await triggerValidationGeneration();
  };

  // Status colors helper for stacked bar segments
  const getStatusColorConfig = (status: EvidenceStatus) => {
    switch (status) {
      case 'SUPPORTED':
        return {
          solidBg: 'bg-emerald-500',
          unearnedBg: 'bg-emerald-500/20',
          border: 'border-emerald-500/40',
          text: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'PARTIAL':
        return {
          solidBg: 'bg-amber-500',
          unearnedBg: 'bg-amber-500/25',
          border: 'border-amber-500/40',
          text: 'text-amber-600 dark:text-amber-400'
        };
      case 'CONFLICT':
        return {
          solidBg: 'bg-rose-500',
          unearnedBg: 'bg-rose-500/25',
          border: 'border-rose-500/40',
          text: 'text-rose-600 dark:text-rose-400'
        };
      case 'HUMAN_REVIEW':
        return {
          solidBg: 'bg-indigo-500',
          unearnedBg: 'bg-indigo-500/25',
          border: 'border-indigo-500/40',
          text: 'text-indigo-600 dark:text-indigo-400'
        };
      case 'UNKNOWN':
      default:
        return {
          solidBg: 'bg-slate-400 dark:bg-slate-500',
          unearnedBg: 'bg-slate-200 dark:bg-slate-800',
          border: 'border-slate-300 dark:border-slate-700',
          text: 'text-slate-500 dark:text-slate-400'
        };
    }
  };

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
            Decision QA Readiness requires an indexed evidence map. This candidate's documents have been uploaded, but competency mapping has not been executed yet.
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

  // Target critical requirement details
  const criticalGapName = currentCriticalUncertainty?.name || 'System Design';
  const criticalGapReq = requirements.find(r => r.name.toLowerCase() === criticalGapName.toLowerCase() || r.id === currentCriticalUncertainty?.requirementId);

  // Critical unresolved levers for honest tiebreak rationale
  const criticalUnresolved = unresolvedLevers.filter(l => l.importance === 'Critical');
  const maxCriticalDelta = criticalUnresolved.length > 0 ? Math.max(...criticalUnresolved.map(c => c.delta)) : 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-10 animate-fade-in text-slate-900 dark:text-[#F1F5F9]">
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
      {/* Screen Question & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#2D3748]">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            04 • Decision QA Room
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Do we have enough evidence to decide?
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 max-w-xl leading-relaxed">
            Evaluating evidentiary readiness to protect the hiring committee from premature conclusions.
          </p>
        </div>

        {isTerminalStopped && (
          <button
            onClick={() => setCurrentStep('06_REVIEW')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
          >
            <span>Proceed to Review</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* HERO SECTION: Animated Circular Readiness Gauge */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-8 sm:p-10 shadow-xs transition-colors">
        <ReadinessGauge
          score={readinessScore}
          status={readinessStatus}
          showDelta={primaryValidation.evaluated}
          delta={22}
        />
      </div>

      {/* VISUAL FLOW CONNECTOR */}
      <div className="flex items-center justify-center -my-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#161B26] border border-slate-200/80 dark:border-[#2D3748] text-[11px] font-mono text-slate-500 dark:text-slate-400 shadow-xs">
          <ArrowDown size={12} className="text-emerald-500" />
          <span>Decision Lever Math & Evidentiary Breakdown</span>
          <ArrowDown size={12} className="text-emerald-500" />
        </div>
      </div>

      {/* FEATURE 2.2: STACKED HORIZONTAL WEIGHT BAR */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-7 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#2D3748]">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-emerald-500" />
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              COMPETENCY WEIGHT ALLOCATION (STACKED EVIDENCE BAR)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              Total Weight: <strong className="text-slate-900 dark:text-white">{totalWeight.toFixed(1)} pts</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Earned: {earnedWeight.toFixed(1)} pts ({readinessScore}%)
            </span>
          </div>
        </div>

        {/* Stacked Horizontal Bar */}
        <div className="space-y-2">
          <div className="relative w-full h-8 bg-slate-100 dark:bg-[#0F1117] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex p-0.5">
            {requirements.map((req) => {
              const weight = DecisionQAEngine.getImportanceWeight(req.importance);
              const contribution = DecisionQAEngine.getStatusContribution(req.status);
              const segmentWidthPercent = totalWeight > 0 ? (weight / totalWeight) * 100 : 0;
              const isHovered = hoveredRequirementId === req.id;
              const colors = getStatusColorConfig(req.status);

              return (
                <div
                  key={req.id}
                  onMouseEnter={() => setHoveredRequirementId(req.id)}
                  onMouseLeave={() => setHoveredRequirementId(null)}
                  style={{ width: `${segmentWidthPercent}%` }}
                  className={`h-full relative px-0.5 transition-all cursor-pointer ${
                    isHovered ? 'scale-y-110 z-10' : ''
                  }`}
                  title={`${req.name} (${req.importance} • ${weight} pts): ${req.status} (${Math.round(contribution * 100)}% earned)`}
                >
                  <div className={`h-full w-full rounded-md overflow-hidden flex border ${colors.border}`}>
                    {/* Earned portion (solid vibrant fill) */}
                    {contribution > 0 && (
                      <div
                        style={{ width: `${contribution * 100}%` }}
                        className={`h-full ${colors.solidBg} transition-all duration-500`}
                      />
                    )}
                    {/* Unearned portion (faded / transparent hatched) */}
                    {contribution < 1.0 && (
                      <div
                        style={{ width: `${(1.0 - contribution) * 100}%` }}
                        className={`h-full ${colors.unearnedBg} transition-all duration-500 relative overflow-hidden`}
                      >
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, currentColor 4px, currentColor 8px)'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 80% Threshold Guide Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-20 pointer-events-none shadow-sm"
              style={{ left: '80%' }}
            >
              <div className="absolute -top-6 -translate-x-1/2 bg-amber-500 text-slate-950 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs">
                80% Target
              </div>
            </div>
          </div>

          {/* Interactive Inspection Details for Hovered Segment */}
          <div className="min-h-[22px] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {hoveredRequirementId ? (
              (() => {
                const hovered = requirements.find(r => r.id === hoveredRequirementId);
                if (!hovered) return <span>Hover across segments to inspect individual criteria weight</span>;
                const w = DecisionQAEngine.getImportanceWeight(hovered.importance);
                const c = DecisionQAEngine.getStatusContribution(hovered.status);
                const earnedPts = w * c;
                return (
                  <span className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                    <strong className="text-emerald-500">{hovered.name}</strong> • {hovered.importance} ({w} pts) → Status: <strong className="text-slate-900 dark:text-white">{hovered.status}</strong> ({earnedPts.toFixed(1)} / {w.toFixed(1)} pts earned)
                  </span>
                );
              })()
            ) : (
              <span>Solid segments = verified earned weight • Hatched/faded = unearned evidentiary gap</span>
            )}
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
              Threshold: 80% (requires 0 critical uncertainties)
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-[#2D3748] text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">SUPPORTED (100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">PARTIAL (50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-300">CONFLICT (0%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 dark:bg-slate-600" />
            <span className="text-slate-600 dark:text-slate-300">UNKNOWN (0%)</span>
          </div>
        </div>
      </div>

      {/* FEATURE 2.2: DECISION LEVER ANALYSIS (RANKED LEVERS) */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-8 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#2D3748]">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              DECISION LEVER ANALYSIS
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
            Ranked by potential readiness gain (Δ)
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {levers.map((lever) => {
            const isSupported = lever.isSupported;
            const isTargetedGap = currentCriticalUncertainty && (
              currentCriticalUncertainty.requirementId === lever.requirementId ||
              currentCriticalUncertainty.name.toLowerCase() === lever.requirementName.toLowerCase()
            );

            // Dynamic honest explanation for why this lever is picked
            let selectionReason = '';
            if (isTargetedGap) {
              const tiedCount = criticalUnresolved.filter(c => c.delta === lever.delta).length;
              if (lever.importance === 'Critical') {
                if (tiedCount > 1 && lever.delta >= maxCriticalDelta) {
                  selectionReason = `Tied for largest readiness gain (+${lever.deltaFormatted}) among Critical gaps — selected as primary next validation.`;
                } else if (lever.delta >= maxCriticalDelta) {
                  selectionReason = `Selected because it has the largest readiness gain among Critical-importance gaps (+${lever.deltaFormatted}).`;
                } else {
                  selectionReason = `Selected because it is an unresolved Critical-importance requirement.`;
                }
              } else {
                selectionReason = `Selected because it has the largest readiness gain among remaining unresolved gaps (+${lever.deltaFormatted}).`;
              }
            }

            return (
              <div
                key={lever.requirementId}
                className={`p-3.5 rounded-xl border transition-all ${
                  isTargetedGap
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-sm ring-2 ring-emerald-500/20'
                    : isSupported
                    ? 'bg-slate-50/50 dark:bg-[#0F1117]/50 border-slate-200/70 dark:border-[#2D3748]/60 opacity-75'
                    : 'bg-white dark:bg-[#0F1117] border-slate-200 dark:border-[#2D3748] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Requirement Name, Importance, Status Transition */}
                  <div className="flex flex-wrap items-center gap-2.5 min-w-[280px]">
                    <span className={`font-bold text-sm ${isTargetedGap ? 'text-emerald-950 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                      {lever.requirementName}
                    </span>
                    <ImportanceBadge importance={lever.importance} size="sm" />
                    <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      isTargetedGap 
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' 
                        : isSupported 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {lever.targetStatusText}
                    </span>
                  </div>

                  {/* Middle: Formula readout: resolving this -> readiness XX% -> YY% (+ZZ%) */}
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      {isSupported ? (
                        <span className="text-slate-400 dark:text-slate-500 italic">already resolved to SUPPORTED</span>
                      ) : (
                        <span>
                          resolving this → readiness <strong className="text-slate-900 dark:text-white">{lever.currentReadiness}%</strong> → <strong className="text-emerald-600 dark:text-emerald-400">{lever.projectedReadiness}%</strong> (<span className="text-emerald-600 dark:text-emerald-400 font-bold">{lever.deltaFormatted}</span>)
                        </span>
                      )}
                    </div>

                    {/* Visual Gain Bar */}
                    <div className="w-24 sm:w-32 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700 flex items-center">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTargetedGap
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : isSupported
                            ? 'bg-transparent'
                            : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                        style={{ width: `${lever.barPercentage}%` }}
                      />
                    </div>

                    {/* Top Lever / Targeted Gap Badge */}
                    <div className="w-32 text-right shrink-0">
                      {isTargetedGap ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs">
                          ← TARGET GAP
                        </span>
                      ) : isSupported ? (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                          no value in re-testing
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          secondary lever
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Targeted Gap Honest Explanation */}
                {isTargetedGap && selectionReason && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 font-sans flex items-center gap-1.5">
                    <Sparkles size={12} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{selectionReason}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Muted Caption */}
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] italic pt-1 leading-relaxed border-t border-slate-100 dark:border-[#2D3748]">
          "HireFlow selects validations by mathematically maximizing readiness gain per minute of interview time, focusing on critical uncertainties."
        </p>
      </div>

      {/* CENTRAL CRITICAL UNCERTAINTY SECTION */}
      {hasCriticalUncertainty ? (
        <div className="bg-white dark:bg-[#1A1F2E] border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 shadow-xs space-y-5 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/40">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400">
              CRITICAL UNCERTAINTY IDENTIFIED
            </span>
            <div className="flex items-center gap-2">
              <ImportanceBadge importance="Critical" size="sm" />
              <button
                type="button"
                onClick={() => setShowWhyGapPopover(!showWhyGapPopover)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <HelpCircle size={13} />
                <span>Why this gap?</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{criticalGapName}</h2>
              <p className="text-xs font-mono text-slate-500 dark:text-[#94A3B8] mt-0.5">
                {criticalGapReq?.reasoning || 'Core Platform Architecture Competency'}
              </p>
            </div>
            <StatusBadge status={criticalGapReq?.status || 'UNKNOWN'} provenance={criticalGapReq?.provenance || 'heuristic'} size="md" />
          </div>

          {showWhyGapPopover && (
            <div className="p-4 rounded-xl bg-slate-900 dark:bg-[#07090C] text-slate-200 border border-rose-500/40 space-y-2 animate-fade-in font-mono text-xs">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Info size={14} />
                  AI Evidentiary Standard Analysis
                </span>
                <button
                  type="button"
                  onClick={() => setShowWhyGapPopover(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                {criticalGapReq?.gapReasoning || `"${criticalGapName} lacks corroborated proof. Per HireFlow's evidentiary threshold for Critical competencies: self-claimed resume mentions without direct code, work samples, or live scenario demonstration evaluate to UNKNOWN, not PARTIAL."`}
              </p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            "This does not mean the candidate lacks the skill. It means the current evidence is insufficient."
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1F2E] border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-8 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-800/40">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-400">
              ALL CRITICAL UNCERTAINTIES RESOLVED
            </span>
            <StatusBadge status="SUPPORTED" provenance={primaryValidation.evaluated ? 'ai' : 'heuristic'} size="sm" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Empirical Verification Complete
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              All critical platform requirements are empirically verified with direct citations and scenario validation.
            </p>
          </div>
        </div>
      )}

      {/* FEATURE 2.3: EXPLICIT TERMINAL STOP-CONDITION CARD vs NEXT BEST MOVE */}
      {isTerminalStopped ? (
        <div className="bg-gradient-to-br from-emerald-950/20 via-white to-emerald-950/10 dark:from-[#0B1512] dark:via-[#1A1F2E] dark:to-[#0B1512] border-2 border-emerald-500/50 rounded-2xl p-8 sm:p-10 shadow-md space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400 block">
                  AGENT STOPPED — AUTONOMOUS LOOP COMPLETE
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Decision Authority Returned to Human Reviewer
                </span>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold border border-emerald-300 dark:border-emerald-700">
              Readiness: {readinessScore}% (≥80% Threshold)
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              No further automated validation generated.
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-sans">
              Evidence readiness ({readinessScore}%) has met the committee threshold and 0 critical uncertainties remain. HireFlow's agentic loop has halted intentionally: candidate friction is minimized, and complete verification telemetry is handed back to the human hiring decision maker.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setCurrentStep('06_REVIEW')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <span>Proceed to Human Review →</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setCurrentStep('AUDIT_TRAIL')}
              className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 dark:border-[#2D3748] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Inspect Cryptographic Audit Log
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-2xl p-8 sm:p-10 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#2D3748]">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-900 dark:text-white">
              NEXT BEST MOVE
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Targeted Signal</span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                "Instead of asking ten more questions, HireFlow recommends one focused validation."
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed font-mono">
                {criticalGapName} is an active uncertainty. A single 5-minute focused scenario directly tests the missing evidence.
              </p>
            </div>

            {/* Scenario Excerpt */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
                Target Scenario
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                "{primaryValidation.scenario}"
              </p>
            </div>

            {/* Evaluation dimensions checklist */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
                Evaluation Dimensions
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {['Scalability', 'API Architecture', 'Database', 'Caching', 'Failure Handling'].map((dim) => (
                  <span key={dim} className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
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
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold py-3 px-6 rounded-lg shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {isGeneratingValidation ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-emerald-400 dark:text-slate-950" />
                    <span>Preparing Scenario...</span>
                  </>
                ) : (
                  <>
                    <FlaskConical size={14} className="text-emerald-400 dark:text-slate-950" />
                    <span>Run 5-minute validation →</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setEvidenceRequested(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 dark:border-[#2D3748] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {evidenceRequested ? 'Evidence Requested ✓' : 'Request Evidence'}
              </button>

              <button
                onClick={() => setHumanReviewMarked(true)}
                className="w-full sm:w-auto px-4 py-3 rounded-lg border border-slate-200 dark:border-[#2D3748] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {humanReviewMarked ? 'Marked for Review ✓' : 'Mark for Human Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
