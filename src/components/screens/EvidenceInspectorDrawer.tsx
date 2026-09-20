import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { 
  X, 
  FileText, 
  ArrowRight, 
  Eye, 
  HelpCircle,
  FlaskConical,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2
} from 'lucide-react';

export const EvidenceInspectorDrawer: React.FC = () => {
  const { 
    selectedInspectorReq, 
    closeInspector, 
    openDocumentViewer, 
    setCurrentStep,
    candidate
  } = useHireFlow();

  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  if (!selectedInspectorReq) return null;

  const handleValidateClick = () => {
    closeInspector();
    setCurrentStep('05_VALIDATION');
  };

  const handleViewSource = () => {
    const isResume = selectedInspectorReq.source.toLowerCase().includes('resume');
    const matchedDoc = isResume
      ? candidate.documents.find(d => d.name.toLowerCase().includes('resume'))?.name || candidate.documents[0]?.name || 'Alex_Morgan_Resume.pdf'
      : candidate.documents.find(d => !d.name.toLowerCase().includes('resume'))?.name || candidate.documents[0]?.name || 'Backend_Project_Readme.pdf';

    openDocumentViewer(
      matchedDoc, 
      selectedInspectorReq.sourceLocation.includes('Page 3') ? 3 : selectedInspectorReq.sourceLocation.includes('Page 2') ? 2 : 1, 
      selectedInspectorReq.snippet || selectedInspectorReq.evidence,
      selectedInspectorReq.name
    );
  };

  // Compute confidence level based on status
  const confidenceLevel = 
    selectedInspectorReq.status === 'SUPPORTED' ? 'High' :
    selectedInspectorReq.status === 'PARTIAL' ? 'Medium' :
    selectedInspectorReq.status === 'CONFLICT' ? 'Medium-Low' : 'Low';

  const confidenceBadgeColor = 
    selectedInspectorReq.status === 'SUPPORTED' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
    selectedInspectorReq.status === 'PARTIAL' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' :
    selectedInspectorReq.status === 'CONFLICT' ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700' :
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  const isCorroborated = (selectedInspectorReq.corroboratedCount ?? 0) > 0 || selectedInspectorReq.status === 'SUPPORTED';
  const sourceType = selectedInspectorReq.evidenceType || (isCorroborated ? 'corroborated' : 'self_claimed');

  return (
    <div className="fixed inset-0 z-40 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={closeInspector}
      />

      {/* Slide-over Investigation Panel (Desktop right drawer, Mobile bottom sheet) */}
      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 max-w-full flex md:pl-10 z-10">
        <motion.div
          initial={prefersReducedMotion ? false : { y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="w-full md:w-screen md:max-w-md max-h-[88dvh] md:max-h-full rounded-t-2xl md:rounded-none bg-white dark:bg-[#1A1F2E] border-t md:border-t-0 md:border-l border-slate-200 dark:border-[#2D3748] shadow-2xl flex flex-col text-slate-900 dark:text-[#F1F5F9] transition-colors"
        >
          {/* Mobile Bottom-Sheet Pull Handle */}
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2.5 mb-1 md:hidden" />

          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#2D3748] flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Evidence Investigation & AI Audit
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">
                {selectedInspectorReq.name}
              </h2>
            </div>

            <button
              onClick={closeInspector}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300">
            {/* Status & Importance Row */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#2D3748]">
              <StatusBadge status={selectedInspectorReq.status} provenance={selectedInspectorReq.provenance || 'heuristic'} size="md" />
              <ImportanceBadge importance={selectedInspectorReq.importance} size="sm" />
            </div>

            {/* FIX 5A: EXPANDABLE AI ANALYSIS SECTION */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setIsAiAnalysisOpen(!isAiAnalysisOpen)}
                className="w-full p-3.5 flex items-center justify-between bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-950 dark:text-emerald-200 font-mono text-xs font-bold transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>AI CLASSIFICATION ANALYSIS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${confidenceBadgeColor}`}>
                    Confidence: {confidenceLevel}
                  </span>
                  {isAiAnalysisOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {isAiAnalysisOpen && (
                <div className="p-4 space-y-3.5 text-xs font-mono leading-relaxed border-t border-emerald-500/20">
                  {/* Field 1: Evidence Found */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Evidence Found:
                    </span>
                    <p className="text-slate-900 dark:text-slate-200 bg-white dark:bg-[#0F1117] p-2.5 rounded-lg border border-slate-200 dark:border-[#2D3748] font-mono italic">
                      "{selectedInspectorReq.snippet || selectedInspectorReq.evidence}"
                    </p>
                  </div>

                  {/* Field 2: Classification Reasoning */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Classification Reasoning:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-sans text-xs bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/40">
                      {selectedInspectorReq.reasoning || "HireFlow cross-referenced technical criteria against documented code artifacts and candidate claims."}
                    </p>
                  </div>

                  {/* Field 3: Source Type & Corroboration */}
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-500/15">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      Source Type:
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      sourceType === 'corroborated' 
                        ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700' 
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                    }`}>
                      {sourceType === 'corroborated' ? '✓ Corroborated Source' : '⚠ Self-Claimed Only'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Why Unknown / Gap Analysis */}
            {selectedInspectorReq.status !== 'SUPPORTED' && selectedInspectorReq.status !== 'CONFLICT' && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                  Why {selectedInspectorReq.status.toLowerCase()}?
                </span>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0F1117] border border-slate-200 dark:border-[#2D3748] text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  "{selectedInspectorReq.gapReasoning || selectedInspectorReq.reasoning}"
                </div>
              </div>
            )}

            {/* CONFLICT SURFACING SIDE-BY-SIDE / DUAL BOXES */}
            {selectedInspectorReq.status === 'CONFLICT' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-rose-700 dark:text-rose-400">
                    CONTRADICTING SOURCE SNIPPETS
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold">
                    Conflict Detected
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(selectedInspectorReq.conflictSnippets || [
                    {
                      source: "Alex_Morgan_Resume.pdf",
                      sourceLocation: "Page 1 — Experience Summary",
                      snippet: "Led a team of 10 backend and frontend engineers building core payments microservices.",
                      type: "self_claimed" as const,
                      label: "Source 1 • Resume Claim"
                    },
                    {
                      source: "Initial_Screen_Transcript.pdf",
                      sourceLocation: "Interviewer Notes — Section 2",
                      snippet: "Worked as individual contributor on payments core without direct engineering reports.",
                      type: "corroborated" as const,
                      label: "Source 2 • Interview Transcript"
                    }
                  ]).map((cs, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/40 dark:bg-rose-950/20 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{cs.label || cs.source}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          cs.type === 'corroborated' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                        }`}>
                          {cs.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{cs.sourceLocation || cs.source}</div>
                      <p className="text-xs text-slate-900 dark:text-slate-200 font-mono italic bg-white dark:bg-[#0F1117] p-2.5 rounded-lg border border-rose-100 dark:border-rose-900 mt-1">
                        "{cs.snippet}"
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 font-sans leading-relaxed">
                  <strong>Notice:</strong> "HireFlow does not choose between contradicting sources. It surfaces the conflict for human review."
                </div>
              </div>
            )}

            {/* Standard Evidence & Snippet (when not conflict) */}
            {selectedInspectorReq.status !== 'CONFLICT' && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                  Source Document Lineage
                </span>
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#2D3748] bg-white dark:bg-[#0F1117] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedInspectorReq.source}
                    </div>
                    {selectedInspectorReq.source !== 'No sufficient source' && (
                      <button
                        onClick={handleViewSource}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-mono"
                      >
                        <Eye size={12} />
                        <span>View Source</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {selectedInspectorReq.sourceLocation}
                  </div>
                </div>
              </div>
            )}

            {/* Missing Dimensions (for System Design / Gaps) */}
            {selectedInspectorReq.status === 'UNKNOWN' && (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                  What is missing?
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Scalability</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Architecture trade-offs</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Failure handling</span>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-slate-100 dark:border-[#2D3748] bg-slate-50 dark:bg-[#1A1F2E] flex items-center gap-3">
            <button
              onClick={handleValidateClick}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold py-2.5 rounded-lg shadow-sm transition-all"
            >
              <FlaskConical size={14} className="text-emerald-400 dark:text-slate-950" />
              <span>Validate {selectedInspectorReq.name} →</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
