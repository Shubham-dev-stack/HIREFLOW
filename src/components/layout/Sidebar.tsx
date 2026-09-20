import React from 'react';
import { Link } from 'react-router-dom';
import { useHireFlow } from '../../context/HireFlowContext';
import { WorkflowStepId } from '../../types';
import { 
  ShieldCheck, 
  History, 
  Settings, 
  RotateCcw,
  Briefcase,
  Users,
  Layers,
  Gauge,
  FlaskConical,
  CheckCircle2,
  ArrowLeft,
  X
} from 'lucide-react';

interface NavItem {
  id: WorkflowStepId;
  num: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const WORKSPACE_NAV: NavItem[] = [
  { id: '01_ROLE', num: '01', label: 'Role Setup', icon: Briefcase },
  { id: '02_CANDIDATES', num: '02', label: 'Candidate Intake', icon: Users },
  { id: '03_EVIDENCE', num: '03', label: 'Evidence Matrix', icon: Layers },
  { id: '04_DECISION_QA', num: '04', label: 'Decision QA', icon: Gauge },
  { id: '05_VALIDATION', num: '05', label: 'Validation', icon: FlaskConical },
  { id: '06_REVIEW', num: '06', label: 'Final Review', icon: CheckCircle2 },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const { 
    currentStep, 
    setCurrentStep, 
    setIsSettingsOpen,
    resetDemo,
    primaryValidation
  } = useHireFlow();

  const handleNavClick = (stepId: WorkflowStepId) => {
    setCurrentStep(stepId);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full select-none font-sans">
      <div>
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[#2D3748] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer" title="HireFlow — Back to Landing Page">
            <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-emerald-500/20 dark:border dark:border-emerald-500/40 flex items-center justify-center text-white dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <div className="hidden lg:block md:hidden sm:block">
              <span className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm tracking-tight font-mono">HIREFLOW</span>
              <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] font-mono leading-none">Decision QA</p>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Workspace Nav Section */}
        <div className="px-3 pt-5">
          <div className="px-3 mb-2 hidden lg:block md:hidden sm:block">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
              Workspace Flow
            </span>
          </div>

          <nav className="space-y-1">
            {WORKSPACE_NAV.map((item) => {
              const isActive = currentStep === item.id;
              const isValidationDone = item.id === '05_VALIDATION' && primaryValidation.evaluated;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={`${item.num} · ${item.label}`}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    isActive
                      ? 'border-l-2 border-emerald-500 bg-slate-100/80 dark:bg-[#0F1117] text-slate-950 dark:text-white font-semibold pl-2.5 shadow-2xs'
                      : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {item.num}
                    </span>
                    <Icon size={14} className={isActive ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'} />
                    <span className="hidden lg:inline md:hidden sm:inline">{item.label}</span>
                  </div>

                  {isValidationDone && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Governance Section */}
        <div className="px-3 pt-6">
          <div className="px-3 mb-2 hidden lg:block md:hidden sm:block">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
              Governance
            </span>
          </div>

          <button
            onClick={() => handleNavClick('AUDIT_TRAIL')}
            title="Audit Trail"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
              currentStep === 'AUDIT_TRAIL'
                ? 'border-l-2 border-emerald-500 bg-slate-100/80 dark:bg-[#0F1117] text-slate-950 dark:text-white font-semibold pl-2.5 shadow-2xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History
                size={14}
                className={currentStep === 'AUDIT_TRAIL' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}
              />
              <span className="hidden lg:inline md:hidden sm:inline">Audit Trail</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden lg:inline md:hidden sm:inline">Lineage</span>
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-3 border-t border-slate-100 dark:border-[#2D3748] space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          title="Return to Landing Page"
        >
          <ArrowLeft size={13} className="text-emerald-500" />
          <span className="hidden lg:inline md:hidden sm:inline">Landing Page</span>
        </Link>

        <div className="flex items-center justify-between px-2 pt-1 text-xs border-t border-slate-100/80 dark:border-[#2D3748]/60">
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            className="flex items-center gap-1.5 text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Settings size={13} />
            <span className="hidden lg:inline md:hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={resetDemo}
            title="Reset to Initial Demo State"
            className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <RotateCcw size={11} />
            <span className="hidden lg:inline md:hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-16 lg:w-56 bg-white dark:bg-[#1A1F2E] border-r border-slate-200/80 dark:border-[#2D3748] h-full shrink-0 z-10 transition-all duration-200">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={onMobileClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />

          {/* Drawer content */}
          <div className="relative w-64 max-w-[80vw] bg-white dark:bg-[#1A1F2E] h-full shadow-2xl z-10 animate-slide-left">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
