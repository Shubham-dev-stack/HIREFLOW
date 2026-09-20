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
  Database,
  UploadCloud,
  Trash2,
  AlertCircle,
  RotateCcw,
  UserPlus,
  X
} from 'lucide-react';

export const CandidateIntakeScreen: React.FC = () => {
  const { 
    candidate, 
    setCandidate,
    candidates,
    activeCandidateId,
    setActiveCandidateId,
    addNewCandidate,
    deleteCandidate,
    role, 
    buildEvidenceMap, 
    isBuildingEvidence, 
    addCandidateDocument,
    removeCandidateDocument,
    loadDemoCandidate,
    openDocumentViewer, 
    setCurrentStep 
  } = useHireFlow();

  const [notes, setNotes] = useState(candidate.interviewNotes || '');
  const [portfolio, setPortfolio] = useState(candidate.portfolioUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const parsed = await addCandidateDocument(file);
        if (parsed.error) {
          setUploadError(`${file.name}: ${parsed.error}`);
        }
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error parsing uploaded documents');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNotesBlur = () => {
    setCandidate(prev => ({
      ...prev,
      interviewNotes: notes,
      portfolioUrl: portfolio
    }));
  };

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

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              const newId = addNewCandidate();
              setActiveCandidateId(newId);
            }}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors"
            title="Create another candidate profile"
          >
            <UserPlus size={13} />
            <span>+ Add Candidate</span>
          </button>

          <button
            onClick={loadDemoCandidate}
            type="button"
            className="px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono transition-colors"
            title="Load benchmark profile (Alex Morgan)"
          >
            Load Demo Candidate
          </button>

          <button
            onClick={buildEvidenceMap}
            disabled={isBuildingEvidence || candidate.documents.length === 0}
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
      </div>

      {/* Multi-candidate Switcher Pills if > 1 candidate */}
      {candidates.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1">Candidate Pool:</span>
          {candidates.map((c) => {
            const isSelected = c.id === activeCandidateId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveCandidateId(c.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 border-slate-900 dark:border-emerald-400 font-semibold shadow-xs'
                    : 'bg-white dark:bg-[#1A1F2E] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D3748] hover:border-slate-400'
                }`}
              >
                <User size={12} className={isSelected ? 'text-white dark:text-slate-950' : 'text-slate-400'} />
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected 
                    ? 'bg-slate-800 dark:bg-emerald-600 text-white dark:text-slate-950' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {c.documents.length} doc{c.documents.length === 1 ? '' : 's'}
                </span>
                {candidates.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCandidate(c.id);
                    }}
                    title={`Remove ${c.name}`}
                    className="ml-1 p-0.5 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DYNAMIC DATA SOURCES SUMMARY CARD AT TOP */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1F2E] border border-emerald-500/30 shadow-xs space-y-3 font-mono text-xs transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#2D3748]">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold tracking-wider uppercase text-[11px]">
            <Database size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>CROSS-REFERENCED DATA SOURCES</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold">
            {candidate.documents.length} SOURCE{candidate.documents.length === 1 ? '' : 'S'} INDEXED
          </span>
        </div>

        <p className="text-slate-700 dark:text-slate-300 font-sans text-xs">
          Evidence extracted and indexed from {candidate.documents.length} source{candidate.documents.length === 1 ? '' : 's'}:
        </p>

        <div className="space-y-2 text-xs font-mono text-slate-800 dark:text-slate-200">
          {candidate.documents.map((doc, idx) => (
            <div key={doc.id || idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748]">
              <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white">{doc.name}</strong> — {doc.size} {doc.pages ? `· ${doc.pages} page(s)` : ''} {doc.wordCount ? `· ${doc.wordCount} words` : ''}
                </div>
                {doc.error && (
                  <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
                    Scanned/Empty Text
                  </span>
                )}
              </div>
            </div>
          ))}

          {candidate.interviewNotes && (
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#0F1117] border border-slate-200/80 dark:border-[#2D3748]">
              <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white">Recruiter Screen Interview Notes</strong> — Qualitative debrief & communication signals.
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] italic pt-1 border-t border-slate-100 dark:border-[#2D3748] font-sans">
          "Every requirement is audited against all ingested sources. Contradictions between documents automatically trigger CONFLICT status."
        </p>
      </div>

      {/* Candidate Profile Identity Banner */}
      <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl p-6 shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-500/40 text-white dark:text-emerald-400 flex items-center justify-center font-bold text-base font-mono">
            {candidate.name.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={candidate.name}
                onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
                className="text-xl font-bold text-slate-900 dark:text-white tracking-tight bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus:border-emerald-500"
                placeholder="Candidate Full Name"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-mono mt-0.5">Evaluating for: {role.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            Active Candidate
          </span>
        </div>
      </div>

      {/* Upload Drop Zone & Documents Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-File Ingestion Dropzone & Documents */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              Ingested Documents ({candidate.documents.length})
            </span>
            <span className="text-[11px] font-mono text-slate-400">PDF, DOCX, TXT, MD</span>
          </div>

          {/* Drag & Drop Multi-file Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl bg-slate-50/50 dark:bg-[#0F1117] flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
          >
            <UploadCloud size={28} className="text-slate-400 dark:text-slate-500" />
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Drag & drop resumes, project readmes, or interview notes
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Extracts text and page citations client-side
            </div>
            <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold cursor-pointer transition-colors shadow-xs">
              <span>Browse Files</span>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    handleFiles(e.target.files);
                  }
                }}
              />
            </label>
            {isUploading && (
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                <Loader2 size={13} className="animate-spin" />
                <span>Parsing pages & indexing text...</span>
              </div>
            )}
          </div>

          {/* Error Banner for Scanned or Corrupted PDFs */}
          {uploadError && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Document Parsing Warning</strong>
                <span>{uploadError}</span>
              </div>
            </div>
          )}

          {/* Document Cards List */}
          <div className="space-y-2.5">
            {candidate.documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg p-4 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className={doc.error ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'} />
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
                      {doc.size} {doc.pages ? `· ${doc.pages} Page(s)` : ''} {doc.wordCount ? `· ${doc.wordCount} words` : ''}
                    </div>
                    {doc.error && (
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5 flex items-center gap-1">
                        <AlertCircle size={11} />
                        <span>{doc.error}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const snippet = doc.parsed?.pages?.[0]?.text?.substring(0, 160) || "Document content verified.";
                      openDocumentViewer(doc.name, 1, snippet);
                    }}
                    className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded border border-slate-200 dark:border-[#2D3748] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Eye size={12} />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => removeCandidateDocument(doc.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Supplemental Notes & Portfolio */}
            <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg p-4 space-y-2.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-slate-400 dark:text-slate-500" />
                  Interview Notes / Debrief Transcript
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">Cross-reference source</span>
              </div>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Paste recruiter screen notes, interview transcripts, or feedback..."
                className="w-full text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#0F1117] p-2.5 rounded border border-slate-200 dark:border-[#2D3748] focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500"
              />
            </div>

            <div className="bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg p-4 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Globe size={14} className="text-slate-400 dark:text-slate-500" />
                <span>Portfolio / GitHub Link</span>
              </div>
              <input
                type="text"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                onBlur={handleNotesBlur}
                className="text-xs font-mono text-right text-slate-700 dark:text-slate-300 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus:border-emerald-500"
                placeholder="github.com/profile"
              />
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
              {candidate.documents.map((doc, i) => (
                <div key={doc.id || i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800">
                    <Check size={11} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{doc.name}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      {doc.size} {doc.pages ? `· ${doc.pages} page(s)` : ''} indexed
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border dark:border-emerald-500/40">
                  <Sparkles size={11} className="text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Ready for Evidence Mapping</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">Audits claims against all sources</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-[#2D3748]">
              <button
                onClick={buildEvidenceMap}
                disabled={isBuildingEvidence || candidate.documents.length === 0}
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
