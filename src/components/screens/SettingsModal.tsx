import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { X, Settings, Sliders, ShieldCheck, Cpu, RefreshCw, Check, UserCheck, AlertCircle } from 'lucide-react';
import { getResolvedModelName, isGeminiKeyConfigured, getLastCallStatus } from '../../services/ai/gemini';

export const SettingsModal: React.FC = () => {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen, 
    resetDemo,
    recruiterName,
    setRecruiterName,
    isAiActive,
    aiErrorNotice
  } = useHireFlow();

  if (!isSettingsOpen) return null;

  const modelName = getResolvedModelName();
  const hasKey = isGeminiKeyConfigured();
  const lastStatus = getLastCallStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="bg-white dark:bg-[#1A1F2E] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2D3748] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky with always visible close button */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-slate-200 dark:border-[#2D3748] flex items-center justify-between bg-slate-50/95 dark:bg-[#1A1F2E]/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-500/40 text-white dark:text-emerald-400 flex items-center justify-center">
              <Settings size={16} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-[#F1F5F9] text-sm">System & Engine Settings</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">AI Provider, Decision QA thresholds, and reviewer preferences</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 pt-4 space-y-6 text-sm text-slate-700 dark:text-slate-300 flex-1">
          {/* Section 0: Reviewer Identity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <UserCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                Reviewer Identity
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Audit Signer</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2D3748] bg-slate-50/70 dark:bg-[#0F1117] flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">
                  Lead Recruiter / Operator Name
                </label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-medium bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  placeholder="Recruiter Name"
                />
              </div>
            </div>
          </div>

          {/* Section 1: AI Provider & Engine Diagnostics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <Cpu size={15} className="text-emerald-600 dark:text-emerald-400" />
                AI Engine & Fallback Diagnostics
              </h4>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                isAiActive 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}>
                {isAiActive ? 'ACTIVE PROVIDER: GEMINI' : 'ACTIVE PROVIDER: HEURISTIC'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#2D3748] bg-slate-900 dark:bg-[#0F1117] text-slate-200 text-xs font-mono space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Resolved Model:</span>
                <span className="text-emerald-400 font-bold">{modelName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Client API Key:</span>
                <span className={hasKey ? 'text-emerald-400' : 'text-amber-400'}>
                  {hasKey ? 'Configured (VITE_GEMINI_API_KEY)' : 'None (Using Serverless Proxy or Heuristic)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Proxy Endpoint:</span>
                <span className="text-slate-300">/api/analyze (Vercel Serverless)</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Last Call Timestamp:</span>
                <span className="text-slate-300">{lastStatus.timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Call Status:</span>
                <span className={lastStatus.source === 'ai' ? 'text-emerald-400' : 'text-slate-300'}>
                  {lastStatus.source === 'ai' ? 'AI Response Verified' : (lastStatus.errorReason || 'Deterministic Rules Engine')}
                </span>
              </div>
            </div>

            {aiErrorNotice && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Notice: {aiErrorNotice}</span>
              </div>
            )}
          </div>

          {/* Section 2: Decision QA Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <Sliders size={15} className="text-emerald-600 dark:text-emerald-400" />
                Readiness Thresholds
              </h4>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">Strict Evidence Model</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2D3748] bg-slate-50/70 dark:bg-[#0F1117]">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Critical Uncertainty Tolerance</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">0 Allowed</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Any critical UNKNOWN locks decision to NOT READY</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2D3748] bg-slate-50/70 dark:bg-[#0F1117]">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Review Readiness Target</div>
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">≥ 80% Required</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Threshold to enable Ready for Human Review</p>
              </div>
            </div>
          </div>

          {/* Section 3: Product Guardrails */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
              Active System Guardrails
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Human Decision Finality:</strong> System enforces human agency; AI never issues automated rejections or hires.
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Unknown ≠ Negative:</strong> Missing evidence is treated strictly as unverified uncertainty, never as candidate incompetence.
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Verbatim Substring Audit:</strong> Citations without verified substring in ingested documents are rejected and downgraded to UNKNOWN.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-[#1A1F2E] flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              resetDemo();
              setIsSettingsOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium hover:underline"
          >
            <RefreshCw size={13} />
            Reset All Demo Data
          </button>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-emerald-500 hover:bg-slate-800 dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
