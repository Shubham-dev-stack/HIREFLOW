import React, { useState } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { 
  FileText, 
  Check, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  User, 
  Eye, 
  Globe, 
  MessageSquare,
  Clock
} from 'lucide-react';

export const CandidateIntakeScreen: React.FC = () => {
  const { 
    candidate, 
    role, 
    buildEvidenceMap, 
    isBuildingEvidence, 
    openDocumentViewer, 
    setCurrentStep 
  } = useHireFlow();

  const [notes, setNotes] = useState(candidate.interviewNotes || '');
  const [portfolio, setPortfolio] = useState(candidate.portfolioUrl || '');

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-10 animate-fade-in">
      {/* Screen Question & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            02 • Candidate Ingestion
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Whose evidence are we evaluating?
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Ingest candidate resumes, portfolios, and interview transcripts to index all raw verifiable evidence.
          </p>
        </div>

        <button
          onClick={buildEvidenceMap}
          disabled={isBuildingEvidence}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-60"
        >
          {isBuildingEvidence ? (
            <>
              <Loader2 size={14} className="animate-spin text-emerald-400" />
              <span>Building Evidence Map...</span>
            </>
          ) : (
            <>
              <span>Build Evidence Map</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      {/* Candidate Profile Identity Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{candidate.name}</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Evaluating for: {role.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-100 text-slate-700 font-medium">
            Active Candidate
          </span>
        </div>
      </div>

      {/* Two Column Ingestion Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Documents & Sources */}
        <div className="md:col-span-7 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 mb-2">
            Document Sources
          </div>

          <div className="space-y-2.5">
            {candidate.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      {doc.name}
                      {doc.isPrimary && (
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {doc.size} · {doc.pages} Pages
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openDocumentViewer(doc.name, 2, "Led core backend development in Python 3.11 using FastAPI and SQLAlchemy")}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Eye size={12} />
                  <span>Inspect</span>
                </button>
              </div>
            ))}

            {/* Supplemental Notes & Portfolio */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-slate-400" />
                  Interview Notes
                </span>
                <span className="text-[10px] font-mono text-slate-400">Recruiter Screen</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                "{notes}"
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Globe size={14} className="text-slate-400" />
                <span>Portfolio & Code</span>
              </div>
              <span className="text-xs font-mono text-slate-500">{portfolio}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Source Ingestion Timeline */}
        <div className="md:col-span-5 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 mb-2">
            Ingestion Lineage
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Check size={11} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Resume imported</div>
                  <div className="text-[11px] text-slate-400">Alex_Morgan_Resume.pdf · 3 pages indexed</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                  <Check size={11} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Project evidence imported</div>
                  <div className="text-[11px] text-slate-400">Backend_Project_Readme.pdf indexed</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={11} className="text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Ready for Evidence Mapping</div>
                  <div className="text-[11px] text-slate-400">Cross-verifies claims against sources</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={buildEvidenceMap}
                disabled={isBuildingEvidence}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-60"
              >
                {isBuildingEvidence ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-emerald-400" />
                    <span>Mapping Evidence...</span>
                  </>
                ) : (
                  <>
                    <span>Build Evidence Map →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
