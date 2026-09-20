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
  Clock,
  Database,
  ShieldCheck
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
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-10 animate-fade-in text-slate-900 dark:text-[#F1F5F9]">
      {/* Screen Question & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#2D3748]">
        <div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            02 • Candidate Ingestion
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Whose evidence are we evaluating?
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed">
            Ingest candidate resumes, portfolios, and interview transcripts to index all raw verifiable evidence.
          </p>
        </div>

        <button
          onClick={buildEvidenceMap}
          disabled={isBuildingEvidence}
          className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-60"
        >
          {isBuildingEvidence ? (
            <>
              <Loader2 size={14} className="animate-spin text-emerald-400 dark:text-slate-950" />
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

      {/* FIX 6: DATA SOURCES SUMMARY CARD AT TOP */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1F2E] border border-emerald-500/30 shadow-xs space-y-3 font-mono text-xs transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2D3748]">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold tracking-wider uppercase text-[11px]">
            <Database size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>CROSS-REFERENCED DATA SOURCES</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
            3 SOURCES INDEXED
          </span>
        </div>

        <p className="text-slate-700 dark:text-slate-300 font-sans text-xs">
          Evidence extracted and indexed from 3 independent sources:
        </p>

        <div className="space-y-2 text-xs font-mono text-slate-800 dark:text-slate-200">
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748]">
            <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">Alex_Morgan_Resume.pdf</strong> — Skills, work experience, 4 production projects.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748]">
            <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">Backend_Project_Readme.pdf</strong> — Technical implementation details & repository architecture.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748]">
            <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white">Recruiter Screen Interview Notes</strong> — Verbal communication, leadership claims, cultural fit.
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] italic pt-1 border-t border-slate-100 dark:border-[#2D3748] font-sans">
          "AI cross-referenced all 3 sources for each requirement. Conflicts between sources are flagged in the Evidence Matrix."
        </p>
      </div>

      {/* Candidate Profile Identity Banner */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-6 shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-500/40 text-white dark:text-emerald-400 flex items-center justify-center font-bold text-base font-mono">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{candidate.name}</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono mt-0.5">Evaluating for: {role.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            Active Candidate
          </span>
        </div>
      </div>

      {/* Two Column Ingestion Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Documents & Sources */}
        <div className="md:col-span-7 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Document Sources
          </div>

          <div className="space-y-2.5">
            {candidate.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg p-4 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-400 dark:text-slate-500" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {doc.name}
                      {doc.isPrimary && (
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {doc.size} · {doc.pages} Pages
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openDocumentViewer(doc.name, 2, "Led core backend development in Python 3.11 using FastAPI and SQLAlchemy")}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded border border-slate-200 dark:border-[#2D3748] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Eye size={12} />
                  <span>Inspect</span>
                </button>
              </div>
            ))}

            {/* Supplemental Notes & Portfolio */}
            <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg p-4 space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-slate-400 dark:text-slate-500" />
                  Interview Notes
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Recruiter Screen</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#0F1117] p-2.5 rounded border border-slate-100 dark:border-[#2D3748]">
                "{notes}"
              </p>
            </div>

            <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Globe size={14} className="text-slate-400 dark:text-slate-500" />
                <span>Portfolio & Code</span>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-[#94A3B8]">{portfolio}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Source Ingestion Timeline */}
        <div className="md:col-span-5 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Ingestion Lineage
          </div>

          <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-5 space-y-4 shadow-xs transition-colors">
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                  <Check size={11} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Resume imported</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">Alex_Morgan_Resume.pdf · 3 pages indexed</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                  <Check size={11} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Project evidence imported</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">Backend_Project_Readme.pdf indexed</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border dark:border-emerald-500/40">
                  <Sparkles size={11} className="text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Ready for Evidence Mapping</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">Cross-verifies claims against sources</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-[#2D3748]">
              <button
                onClick={buildEvidenceMap}
                disabled={isBuildingEvidence}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-60"
              >
                {isBuildingEvidence ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-emerald-400 dark:text-slate-950" />
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
