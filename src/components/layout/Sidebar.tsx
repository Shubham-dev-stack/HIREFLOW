import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { WorkflowStepId } from '../../types';
import { 
  ShieldCheck, 
  History, 
  Settings, 
  RotateCcw,
  Check
} from 'lucide-react';

interface NavItem {
  id: WorkflowStepId;
  num: string;
  label: string;
}

const WORKSPACE_NAV: NavItem[] = [
  { id: '01_ROLE', num: '01', label: 'Role Setup' },
  { id: '02_CANDIDATES', num: '02', label: 'Candidate Intake' },
  { id: '03_EVIDENCE', num: '03', label: 'Evidence Matrix' },
  { id: '04_DECISION_QA', num: '04', label: 'Decision QA' },
  { id: '05_VALIDATION', num: '05', label: 'Validation' },
  { id: '06_REVIEW', num: '06', label: 'Final Review' },
];

export const Sidebar: React.FC = () => {
  const { 
    currentStep, 
    setCurrentStep, 
    setIsSettingsOpen,
    resetDemo,
    primaryValidation
  } = useHireFlow();

  return (
    <aside className="w-56 bg-white border-r border-slate-200/80 flex flex-col justify-between h-full select-none shrink-0 z-10 font-sans">
      <div>
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white">
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight">HIREFLOW</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">Evidence-first Decision QA</p>
        </div>

        {/* Workspace Nav Section */}
        <div className="px-3 pt-5">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
              Workspace Flow
            </span>
          </div>

          <nav className="space-y-0.5">
            {WORKSPACE_NAV.map((item) => {
              const isActive = currentStep === item.id;
              const isValidationDone = item.id === '05_VALIDATION' && primaryValidation.evaluated;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentStep(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all ${
                    isActive
                      ? 'border-l-2 border-emerald-500 bg-slate-50/80 text-slate-950 font-semibold pl-2.5 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        isActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {item.num}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {isValidationDone && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Governance Section */}
        <div className="px-3 pt-6">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
              Governance
            </span>
          </div>

          <button
            onClick={() => setCurrentStep('AUDIT_TRAIL')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all ${
              currentStep === 'AUDIT_TRAIL'
                ? 'border-l-2 border-emerald-500 bg-slate-50/80 text-slate-950 font-semibold pl-2.5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History
                size={14}
                className={currentStep === 'AUDIT_TRAIL' ? 'text-emerald-600' : 'text-slate-400'}
              />
              <span>Audit Trail</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Lineage</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <div className="flex items-center justify-between px-2 py-1 text-xs">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Settings size={13} />
            <span>Settings</span>
          </button>

          <button
            onClick={resetDemo}
            title="Reset to Initial Demo State"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
          >
            <RotateCcw size={11} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
