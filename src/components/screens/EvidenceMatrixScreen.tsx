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
  FileText
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
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-10 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            03 • Evidence Coverage
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            What do we actually know?
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Direct citations and coverage strength across all target role requirements.
          </p>
        </div>

        <button
          onClick={() => setCurrentStep('04_DECISION_QA')}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all"
        >
          <span>Continue to Decision QA</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Top Metrics Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 font-mono">
            {requirements.length} Requirements
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-mono text-slate-500">
            {supportedCount} Supported · {partialCount} Partial · {unknownCount} Unknown
          </span>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Click any card to inspect evidence lineage
        </span>
      </div>

      {/* Premium Evidence Cards List */}
      <div className="space-y-3.5">
        {requirements.map((req) => {
          const isSupported = req.status === 'SUPPORTED';
          const isPartial = req.status === 'PARTIAL';
          const isUnknown = req.status === 'UNKNOWN';

          return (
            <div
              key={req.id}
              onClick={() => openInspector(req)}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
            >
              {/* Card Top Row: Requirement Name & Status */}
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isSupported 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : isPartial
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {isSupported ? (
                      <Check size={12} strokeWidth={2.5} />
                    ) : isPartial ? (
                      <AlertCircle size={12} />
                    ) : (
                      <HelpCircle size={12} />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {req.name}
                  </h3>

                  <ImportanceBadge importance={req.importance} size="sm" />
                </div>

                <StatusBadge status={req.status} provenance={req.provenance || 'heuristic'} size="sm" />
              </div>

              {/* Card Middle: Prominent Evidence Excerpt */}
              <p className="text-sm text-slate-800 leading-relaxed font-sans mt-1">
                {req.evidence}
              </p>

              {/* FEATURE 3: Claim vs Corroboration Two-Segment Bar */}
              <div className="flex items-center gap-2.5 pt-2.5 font-mono text-[11px]">
                <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden flex border border-slate-200/80 shrink-0">
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
                <span className="text-slate-500 font-medium">
                  <span className="text-emerald-700 font-bold">{req.corroboratedCount ?? 0} corroborated</span> · <span className="text-amber-800 font-bold">{req.claimedCount ?? 0} claimed</span>
                </span>
              </div>

              {/* Card Bottom Row: Source Citation & Arrow */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs font-mono text-slate-400 group-hover:text-slate-600 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-slate-400" />
                  <span>{req.source}</span>
                  {req.sourceLocation && req.source !== 'No sufficient source' && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{req.sourceLocation}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-slate-900 font-semibold text-[11px] group-hover:text-emerald-700 transition-colors">
                    <span>Inspect</span>
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Inspector Drawer */}
      <EvidenceInspectorDrawer />
    </div>
  );
};
