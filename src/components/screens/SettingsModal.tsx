import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { X, Settings, Sliders, ShieldCheck, Database, Cpu, RefreshCw, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, resetDemo } = useHireFlow();

  if (!isSettingsOpen) return null;

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
              <h3 className="font-semibold text-slate-900 dark:text-[#F1F5F9] text-sm">System & QA Settings</h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Decision Readiness configuration and integration hooks</p>
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

        {/* Scrollable Content Body with padding-top: 16px and overflow-y: auto */}
        <div className="overflow-y-auto p-6 pt-4 space-y-6 text-sm text-slate-700 dark:text-slate-300 flex-1">
          {/* Section 1: Decision QA Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <Sliders size={15} className="text-emerald-600 dark:text-emerald-400" />
                Readiness Thresholds
              </h4>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8]">Strict Model</span>
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

          {/* Section 2: Product Guardrails */}
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
                  <strong>Unknown ≠ Negative:</strong> System treats missing evidence as unverified uncertainty, never negative capability.
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200">
                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Minimum Targeted Validation:</strong> Suggests smallest focused next step rather than lengthy multi-hour assessments.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Architecture Integration Stubs */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <Cpu size={15} className="text-slate-600 dark:text-slate-400" />
              API Integration Status
            </h4>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#2D3748] bg-slate-900 dark:bg-[#0F1117] text-slate-200 text-xs font-mono space-y-1">
              <div className="text-emerald-400">// Gemini 3.8 Flash & Deterministic Fallback</div>
              <div>POST /api/v1/roles/analyze [ACTIVE]</div>
              <div>POST /api/v1/evidence/extract [ACTIVE]</div>
              <div>POST /api/v1/validations/evaluate [ACTIVE]</div>
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
