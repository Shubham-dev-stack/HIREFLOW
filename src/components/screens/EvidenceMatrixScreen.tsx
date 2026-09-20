import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { EvidenceInspectorDrawer } from './EvidenceInspectorDrawer';
import { 
  ArrowRight, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  HelpCircle,
  FileText,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export const EvidenceMatrixScreen: React.FC = () => {
  const { 
    requirements, 
    openInspector, 
    setCurrentStep, 
    candidate,
    supportedCount,
    partialCount,
    unknownCount
  } = useHireFlow();

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-10 animate-fade-in relative text-slate-900 dark:text-[#F1F5F9]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#2D3748]">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            03 • Evidence Coverage
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tracking-tight">
            What do we actually know?
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed">
            Direct citations and coverage strength across all target role requirements.
          </p>
        </div>

        <button
          onClick={() => setCurrentStep('04_DECISION_QA')}
          className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <span>Continue to Decision QA</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Top Metrics Row with Status Explanations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            {requirements.length} Requirements
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{supportedCount} Supported</span> · <span className="text-amber-600 dark:text-amber-400 font-bold">{partialCount} Partial</span> · <span className="text-slate-500 dark:text-slate-400 font-bold">{unknownCount} Unknown</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-slate-400 dark:text-slate-500">
          <Info size={13} className="text-slate-400" />
          <span>Click any card to inspect AI analysis & source lineage</span>
        </div>
      </div>

      {/* Premium Evidence Cards List */}
      <div className="space-y-3.5">
        {requirements.map((req) => {
          const isSupported = req.status === 'SUPPORTED';
          const isPartial = req.status === 'PARTIAL';
          const isUnknown = req.status === 'UNKNOWN';
          const isConflict = req.status === 'CONFLICT';

          return (
            <div
              key={req.id}
              onClick={() => openInspector(req)}
              className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer shadow-xs group"
            >
              {/* Card Top Row: Requirement Name & Status */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isSupported 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700' 
                      : isPartial
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700'
                      : isConflict
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {isSupported ? (
                      <Check size={12} strokeWidth={2.5} />
                    ) : isPartial ? (
                      <AlertCircle size={12} />
                    ) : isConflict ? (
                      <AlertCircle size={12} className="text-rose-600 dark:text-rose-400" />
                    ) : (
                      <HelpCircle size={12} />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {req.name}
                  </h3>

                  <ImportanceBadge importance={req.importance} size="sm" />
                </div>

                <StatusBadge status={req.status} provenance={req.provenance || 'heuristic'} size="sm" />
              </div>

              {/* Card Middle: Prominent Evidence Excerpt */}
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans mt-1">
                {req.evidence}
              </p>

              {/* Claim vs Corroboration Two-Segment Bar */}
              <div className="flex items-center gap-2.5 pt-2.5 font-mono text-[11px]">
                <div className="w-20 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex border border-slate-200/80 dark:border-slate-700 shrink-0">
                  <div
                    className="h-full bg-emerald-500"
                    title={`${req.corroboratedCount ?? 0} corroborated`}
                    style={{
                      width: `${((req.corroboratedCount ?? 0) / Math.max(1, (req.corroboratedCount ?? 0) + (req.claimedCount ?? 0))) * 100}%`
                    }}
                  />
                  <div
                    className="h-full bg-amber-400"
                    title={`${req.claimedCount ?? 0} self-claimed`}
                    style={{
                      width: `${((req.claimedCount ?? 0) / Math.max(1, (req.corroboratedCount ?? 0) + (req.claimedCount ?? 0))) * 100}%`
                    }}
                  />
                </div>
                <span className="text-slate-500 dark:text-[#94A3B8] font-medium">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{req.corroboratedCount ?? 0} corroborated</span> · <span className="text-amber-800 dark:text-amber-400 font-bold">{req.claimedCount ?? 0} claimed</span>
                </span>
              </div>

              {/* Card Bottom Row: Source Citation & Arrow */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#2D3748] text-xs font-mono text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-slate-400 dark:text-slate-500" />
                  <span>{req.source}</span>
                  {req.sourceLocation && req.source !== 'No sufficient source' && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 dark:text-slate-400">{req.sourceLocation}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold text-[11px] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <span>Inspect AI Analysis</span>
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FIX 6: Evidence Status Standard Legend */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] shadow-xs space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold tracking-wider uppercase text-[11px]">
          <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>EVIDENCE STATUS CRITERIA & STANDARDS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748] flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
            <div>
              <strong className="text-emerald-700 dark:text-emerald-400">SUPPORTED:</strong> Strong corroborated evidence found across independent sources.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748] flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
            <div>
              <strong className="text-amber-700 dark:text-amber-400">PARTIAL:</strong> Evidence exists but below the requirement's rigorous evidence standard.
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748] flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0 mt-1" />
            <div>
              <strong className="text-slate-800 dark:text-slate-300">UNKNOWN:</strong> No verifiable evidence found (<span className="italic">absence ≠ negative capability</span>).
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748] flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
            <div>
              <strong className="text-rose-700 dark:text-rose-400">CONFLICT:</strong> Contradicting evidence identified between two or more documents.
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Inspector Drawer */}
      <EvidenceInspectorDrawer />
    </div>
  );
};
