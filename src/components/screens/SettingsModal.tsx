import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { X, Settings, Sliders, ShieldCheck, Database, Cpu, RefreshCw, Check } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, resetDemo } = useHireFlow();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
              <Settings size={16} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-sm">System & QA Settings</h3>
              <p className="text-xs text-zinc-500">Decision Readiness configuration and integration hooks</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm text-zinc-700">
          {/* Section 1: Decision QA Thresholds */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-zinc-900 flex items-center gap-2">
                <Sliders size={15} className="text-emerald-600" />
                Readiness Thresholds
              </h4>
              <span className="text-[11px] font-mono text-zinc-600">Strict Model</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="text-xs font-medium text-zinc-600">Critical Uncertainty Tolerance</div>
                <div className="text-sm font-bold text-zinc-900 mt-1 font-mono">0 Allowed</div>
                <p className="text-[11px] text-zinc-600 mt-0.5">Any critical UNKNOWN locks decision to NOT READY</p>
              </div>

              <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50/50">
                <div className="text-xs font-medium text-zinc-600">Review Readiness Target</div>
                <div className="text-sm font-bold text-emerald-700 mt-1 font-mono">≥ 80% Required</div>
                <p className="text-[11px] text-zinc-600 mt-0.5">Threshold to enable Ready for Human Review</p>
              </div>
            </div>
          </div>

          {/* Section 2: Product Guardrails */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600" />
              Active System Guardrails
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-950">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Human Decision Finality:</strong> System enforces human agency; AI never issues automated rejections or hires.
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-950">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Unknown ≠ Negative:</strong> System treats missing evidence as unverified uncertainty, never negative capability.
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-950">
                <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Minimum Targeted Validation:</strong> Suggests smallest focused next step rather than lengthy multi-hour assessments.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Architecture Integration Stubs */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 flex items-center gap-2">
              <Cpu size={15} className="text-zinc-600" />
              API Integration Readiness
            </h4>
            <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-900 text-zinc-200 text-xs font-mono space-y-1">
              <div className="text-emerald-400">// Ready for Phase 2 Backend Hooks</div>
              <div>POST /api/v1/roles/analyze</div>
              <div>POST /api/v1/evidence/extract</div>
              <div>POST /api/v1/validations/evaluate</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            onClick={() => {
              resetDemo();
              setIsSettingsOpen(false);
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
          >
            <RefreshCw size={13} />
            Reset All Demo Data
          </button>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
