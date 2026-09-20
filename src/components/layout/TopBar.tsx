import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { ShieldCheck, User, Briefcase, Terminal, Sparkles, Sun, Moon } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    candidate, 
    role, 
    isAiActive,
    isAgentLogOpen,
    setIsAgentLogOpen,
    agentLogs,
    theme,
    toggleTheme
  } = useHireFlow();

  return (
    <header className="h-14 bg-white dark:bg-[#1A1F2E] border-b border-slate-200/80 dark:border-[#2D3748] px-8 flex items-center justify-between shrink-0 select-none z-10 transition-colors">
      {/* Left: Role and Candidate context */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-[#F1F5F9]">
          <Briefcase size={14} className="text-slate-400 dark:text-slate-500" />
          <span>{role.title}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700">/</span>

        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-[#94A3B8]">
          <User size={14} className="text-slate-400 dark:text-slate-500" />
          <span>{candidate.name}</span>
        </div>
      </div>

      {/* Right: Theme Toggle, AI Mode Status Dot & Agent Log Drawer Button */}
      <div className="flex items-center gap-3">
        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2D3748] bg-slate-50 dark:bg-[#0F1117] text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Status Dot: Green if AI active, Grey if heuristic mode */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 dark:bg-[#0F1117] text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200/60 dark:border-[#2D3748] select-none"
          title={isAiActive ? 'Gemini 3.8 Flash AI Active' : 'Deterministic Heuristic Engine Active (Offline Mode)'}
        >
          <span 
            className={`w-2 h-2 rounded-full transition-colors ${
              isAiActive ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse' : 'bg-slate-400'
            }`} 
          />
          <span className="text-[11px] font-medium">
            {isAiActive ? 'Gemini AI' : 'Heuristic Mode'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#0F1117] text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200/60 dark:border-[#2D3748]">
          <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>Evidence QA</span>
        </div>

        {/* Collapsible Agent Log Toggle Button */}
        <button
          onClick={() => setIsAgentLogOpen(!isAgentLogOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
            isAgentLogOpen 
              ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 border-slate-900 dark:border-emerald-400 shadow-xs' 
              : 'bg-white dark:bg-[#0F1117] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D3748] hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Toggle Agent Reasoning Trace"
        >
          <Terminal size={13} className={isAgentLogOpen ? (theme === 'dark' ? 'text-slate-950' : 'text-emerald-400') : 'text-slate-500 dark:text-slate-400'} />
          <span>Agent Log</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            isAgentLogOpen 
              ? (theme === 'dark' ? 'bg-emerald-600 text-slate-950' : 'bg-slate-800 text-emerald-400') 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {agentLogs.length}
          </span>
        </button>
      </div>
    </header>
  );
};

