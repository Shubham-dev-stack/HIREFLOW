import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { X, FileText, ExternalLink, Download, Search, CheckCircle2 } from 'lucide-react';

export const DocumentViewerModal: React.FC = () => {
  const { documentViewer, closeDocumentViewer, candidate } = useHireFlow();

  if (!documentViewer.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <FileText size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-900 text-sm">{documentViewer.documentName}</h3>
                <span className="text-[11px] font-mono bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded">
                  Page {documentViewer.highlightPage || 2} of 3
                </span>
              </div>
              <p className="text-xs text-zinc-500">Candidate: {candidate.name} • Verified Document Source</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeDocumentViewer}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Document Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-100/60">
          <div className="max-w-2xl mx-auto bg-white border border-zinc-300 rounded-lg shadow-sm p-8 font-sans space-y-6 text-zinc-800 text-sm leading-relaxed">
            {/* Document Header */}
            <div className="border-b border-zinc-200 pb-4">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{candidate.name}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Senior Backend Engineer • San Francisco, CA • {candidate.portfolioUrl}</p>
            </div>

            {/* Experience Section */}
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-zinc-900 text-sm uppercase tracking-wider font-mono text-zinc-500">
                  Professional Experience
                </h4>
                <span className="text-xs text-zinc-600">2021 — Present</span>
              </div>

              <div className="mt-2 space-y-3">
                <div>
                  <div className="font-semibold text-zinc-900">Lead Backend Engineer — CloudScale Systems</div>
                  <div className="text-xs text-zinc-500 mb-2">San Francisco, CA</div>

                  <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-700">
                    <li className={documentViewer.snippet?.includes('Python') ? 'bg-emerald-50 p-2 rounded border border-emerald-200 -ml-2 text-emerald-950 font-medium' : ''}>
                      Led core backend development in <strong>Python 3.11 using FastAPI and SQLAlchemy</strong>; transitioned legacy synchronous endpoints to async coroutines, reducing median endpoint latency by 28%.
                    </li>
                    <li className={documentViewer.snippet?.includes('PostgreSQL') ? 'bg-emerald-50 p-2 rounded border border-emerald-200 -ml-2 text-emerald-950 font-medium' : ''}>
                      Managed <strong>PostgreSQL cluster schemas</strong>, optimized slow analytical queries reducing p99 latency by 35%, and wrote complex migration scripts.
                    </li>
                    <li className={documentViewer.snippet?.includes('FastAPI') && !documentViewer.snippet?.includes('Python') ? 'bg-amber-50 p-2 rounded border border-amber-200 -ml-2 text-amber-950 font-medium' : ''}>
                      Designed and implemented <strong>15+ RESTful endpoints</strong> for customer account management using FastAPI and Pydantic validation models.
                    </li>
                    <li className={documentViewer.snippet?.includes('FastAPI and PostgreSQL') ? 'bg-zinc-100 p-2 rounded border border-zinc-300 -ml-2 text-zinc-900 font-medium' : ''}>
                      Designed backend services using <strong>FastAPI and PostgreSQL</strong> for core client-facing microservices.
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-zinc-100">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-zinc-900">Backend Software Engineer — DataBridge Inc.</div>
                    <span className="text-xs text-zinc-600">2019 — 2021</span>
                  </div>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-zinc-700">
                    <li className={documentViewer.snippet?.includes('mentored') ? 'bg-amber-50 p-2 rounded border border-amber-200 -ml-2 text-amber-950 font-medium' : ''}>
                      Onboarded and <strong>mentored 2 junior backend engineers</strong>; instituted weekly technical syncs and pair programming sessions.
                    </li>
                    <li>Built automated ingestion pipelines processing CSV/JSON batch streams.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Highlighted Snippet Box */}
            {documentViewer.snippet && (
              <div className="mt-6 p-4 rounded-lg bg-zinc-900 text-white space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 size={14} />
                    Verified Evidence Reference
                  </span>
                  <span>Page {documentViewer.highlightPage} Citation</span>
                </div>
                <p className="text-xs text-zinc-200 italic font-mono bg-zinc-800/80 p-2.5 rounded border border-zinc-700">
                  "{documentViewer.snippet}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-white flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono">
            Document hash: SHA256: 8f9b...a102 (Immutable Source)
          </span>
          <button
            onClick={closeDocumentViewer}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
