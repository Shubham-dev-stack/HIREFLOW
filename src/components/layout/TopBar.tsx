import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { ShieldCheck, User, Briefcase, Terminal, Sparkles } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    candidate, 
    role, 
    isAiActive,
    isAgentLogOpen,
    setIsAgentLogOpen,
    agentLogs
  } = useHireFlow();

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 select-none z-10">
      {/* Left: Role and Candidate context */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
          <Briefcase size={14} className="text-slate-400" />
          <span>{role.title}</span>
        </div>

        <span className="text-slate-300">/</span>

        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <User size={14} className="text-slate-400" />
          <span>{candidate.name}</span>
        </div>
      </div>

      {/* Right: AI Mode Status Dot & Agent Log Drawer Button */}
      <div className="flex items-center gap-3">
        {/* Status Dot: Green if AI active, Grey if heuristic mode */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 text-slate-700 text-xs font-mono border border-slate-200/60 select-none"
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

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium border border-slate-200/60">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>Evidence QA</span>
        </div>

        {/* Collapsible Agent Log Toggle Button */}
        <button
          onClick={() => setIsAgentLogOpen(!isAgentLogOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
            isAgentLogOpen 
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title="Toggle Agent Reasoning Trace"
        >
          <Terminal size={13} className={isAgentLogOpen ? 'text-emerald-400' : 'text-slate-500'} />
          <span>Agent Log</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            isAgentLogOpen ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
          }`}>
            {agentLogs.length}
          </span>
        </button>
      </div>
    </header>
  );
};

