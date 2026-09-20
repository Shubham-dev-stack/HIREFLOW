import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { StatusBadge } from '../common/StatusBadge';
import { ImportanceBadge } from '../common/ImportanceBadge';
import { 
  X, 
  FileText, 
  ArrowRight, 
  Eye, 
  HelpCircle,
  FlaskConical
} from 'lucide-react';

export const EvidenceInspectorDrawer: React.FC = () => {
  const { 
    selectedInspectorReq, 
    closeInspector, 
    openDocumentViewer, 
    setCurrentStep 
  } = useHireFlow();

  if (!selectedInspectorReq) return null;

  const handleValidateClick = () => {
    closeInspector();
    setCurrentStep('05_VALIDATION');
  };

  const handleViewSource = () => {
    if (selectedInspectorReq.source.includes('Resume')) {
      openDocumentViewer(
        'Alex_Morgan_Resume.pdf', 
        selectedInspectorReq.sourceLocation.includes('Page 3') ? 3 : 2, 
        selectedInspectorReq.snippet || selectedInspectorReq.evidence,
        selectedInspectorReq.name
      );
    } else {
      openDocumentViewer(
        'Backend_Project_Readme.pdf', 
        1, 
        selectedInspectorReq.snippet || selectedInspectorReq.evidence,
        selectedInspectorReq.name
      );
    }
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] transition-opacity animate-fade-in"
        onClick={closeInspector}
      />

      {/* Slide-over Investigation Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-xl flex flex-col animate-slide-left">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1">
                Evidence Investigation
              </span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {selectedInspectorReq.name}
              </h2>
            </div>

            <button
              onClick={closeInspector}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700">
            {/* Status & Importance Row */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <StatusBadge status={selectedInspectorReq.status} provenance={selectedInspectorReq.provenance || 'heuristic'} size="md" />
              <ImportanceBadge importance={selectedInspectorReq.importance} size="sm" />
            </div>

            {/* Why Unknown / Gap Analysis */}
            {selectedInspectorReq.status !== 'SUPPORTED' && selectedInspectorReq.status !== 'CONFLICT' && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400">
                  Why {selectedInspectorReq.status.toLowerCase()}?
                </span>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                  "{selectedInspectorReq.gapReasoning || selectedInspectorReq.reasoning}"
                </div>
              </div>
            )}

            {/* FEATURE 3: CONFLICT SURFACING SIDE-BY-SIDE / DUAL BOXES */}
            {selectedInspectorReq.status === 'CONFLICT' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-rose-700">
                    CONTRADICTING SOURCE SNIPPETS
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
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
                    <div key={idx} className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{cs.label || cs.source}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          cs.type === 'corroborated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cs.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans">{cs.sourceLocation || cs.source}</div>
                      <p className="text-xs text-slate-900 font-mono italic bg-white p-2.5 rounded-lg border border-rose-100 mt-1">
                        "{cs.snippet}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Surface Conflict Note */}
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 font-sans leading-relaxed">
                  <strong>Notice:</strong> "HireFlow does not choose between contradicting sources. It surfaces the conflict for human review."
                </div>
              </div>
            )}

            {/* Standard Evidence & Snippet (when not conflict) */}
            {selectedInspectorReq.status !== 'CONFLICT' && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400">
                  Source Document
                </span>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900">
                      {selectedInspectorReq.source}
                    </div>
                    {selectedInspectorReq.source !== 'No sufficient source' && (
                      <button
                        onClick={handleViewSource}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 underline"
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono">
                    {selectedInspectorReq.sourceLocation}
                  </div>

                  {selectedInspectorReq.snippet && (
                    <p className="text-xs text-slate-700 italic border-t border-slate-100 pt-2 font-mono">
                      "{selectedInspectorReq.snippet}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Missing Dimensions (for System Design / Gaps) */}
            {selectedInspectorReq.status === 'UNKNOWN' && (
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-400">
                  What is missing?
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">Scalability</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">Architecture trade-offs</span>
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">Failure handling</span>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
            <button
              onClick={handleValidateClick}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm transition-all"
            >
              <FlaskConical size={14} className="text-emerald-400" />
              <span>Validate {selectedInspectorReq.name} →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
