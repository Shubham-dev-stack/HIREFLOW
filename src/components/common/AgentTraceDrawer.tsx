import React from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { X, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

export const AgentTraceDrawer: React.FC = () => {
  const { isAgentLogOpen, setIsAgentLogOpen, agentLogs } = useHireFlow();

  if (!isAgentLogOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px] transition-opacity"
        onClick={() => setIsAgentLogOpen(false)}
      />

      {/* Slide-over Right Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-slate-950 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col animate-slide-left font-mono">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Terminal size={15} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Agent Reasoning Trace</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                <p className="text-[11px] text-slate-400">
                  Real-time decision validation log
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAgentLogOpen(false)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Trace Logs List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
            {agentLogs.map((log) => {
              const isStop = log.isStop || log.phase === 'STOP';

              if (isStop) {
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold text-[13px] leading-relaxed shadow-xs space-y-1 my-2"
                  >
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={15} className="shrink-0" />
                      <span className="text-[11px] text-emerald-500/80">[{log.timestamp}]</span>
                      <span className="tracking-wider uppercase font-bold text-emerald-400">STOP</span>
                    </div>
                    <div className="pl-6 text-emerald-200">
                      {log.message}
                    </div>
                  </div>
                );
              }

              const phaseColors: Record<string, string> = {
                OBSERVE: 'text-sky-400',
                DECIDE: 'text-amber-400',
                ANALYZE: 'text-purple-400',
                ACT: 'text-indigo-400',
                'RE-EVALUATE': 'text-emerald-400',
              };

              const color = phaseColors[log.phase] || 'text-slate-300';

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 py-1 text-slate-300 leading-relaxed font-mono hover:bg-slate-900/50 px-2 -mx-2 rounded transition-colors"
                >
                  <span className="text-slate-500 shrink-0 text-[11px]">
                    [{log.timestamp}]
                  </span>
                  <span className={`font-bold shrink-0 tracking-wider w-24 ${color}`}>
                    {log.phase}
                  </span>
                  <span className="text-slate-400 shrink-0">—</span>
                  <span className="text-slate-200 flex-1">
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer status */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-emerald-400" />
              <span>Deterministic Heuristic & Gemini Fallback</span>
            </span>
            <span className="text-slate-500">
              {agentLogs.length} events logged
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
