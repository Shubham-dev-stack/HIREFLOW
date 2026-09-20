import React, { useState, useEffect, useRef } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { 
  Terminal, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { AgentLogEntry } from '../../types';

interface PayloadViewerProps {
  label: string;
  data: any;
}

const PayloadViewer: React.FC<PayloadViewerProps> = ({ label, data }) => {
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;

  const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const isLong = formatted.length > 200;
  const displayText = isLong && !expanded ? formatted.slice(0, 200) + '...' : formatted;

  return (
    <div className="mt-2 p-2.5 rounded-lg bg-slate-900/90 dark:bg-[#07090C] border border-slate-800 text-[11px] font-mono">
      <div className="flex items-center justify-between text-slate-400 mb-1">
        <span className="uppercase text-[10px] font-bold text-slate-400 tracking-wider">{label}</span>
        {isLong && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-emerald-400 hover:text-emerald-300 underline text-[10px] font-semibold"
          >
            {expanded ? 'Show less' : `Show more (${formatted.length} chars)`}
          </button>
        )}
      </div>
      <pre className="whitespace-pre-wrap break-all text-slate-300 font-mono overflow-x-auto text-[10px] leading-relaxed">
        {displayText}
      </pre>
    </div>
  );
};

export const AgentTracePanel: React.FC = () => {
  const { 
    agentLogs, 
    isAgentPanelCollapsed, 
    setIsAgentPanelCollapsed, 
    toggleAgentPanel,
    setIsAgentLogOpen,
    activeAgentPhase,
    readinessScore,
    currentCriticalUncertainty,
    requirements
  } = useHireFlow();

  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const prevLogsLengthRef = useRef(agentLogs.length);

  // Auto-scroll when new logs stream in
  useEffect(() => {
    if (agentLogs.length > prevLogsLengthRef.current) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLogsLengthRef.current = agentLogs.length;
  }, [agentLogs.length]);

  const toggleLogExpansion = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  const hasCriticalUncertainty = requirements.some(
    r => r.importance === 'Critical' && (r.status === 'UNKNOWN' || r.status === 'CONFLICT')
  );
  const isTerminalStopped = readinessScore >= 80 && !hasCriticalUncertainty;

  const phaseBadgeColors: Record<AgentLogEntry['phase'], { bg: string; text: string; border: string }> = {
    OBSERVE: { bg: 'bg-sky-500/10 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/30' },
    ANALYZE: { bg: 'bg-purple-500/10 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
    DECIDE: { bg: 'bg-amber-500/10 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
    ACT: { bg: 'bg-indigo-500/10 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
    'RE-EVALUATE': { bg: 'bg-emerald-500/10 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
    STOP: { bg: 'bg-emerald-600/20 dark:bg-emerald-900/40', text: 'text-emerald-500 dark:text-emerald-300', border: 'border-emerald-500/50' },
  };

  return (
    <>
      {/* MOBILE PERSISTENT FLOATING REOPEN BUTTON (<1024px) */}
      <button
        type="button"
        onClick={() => {
          setIsAgentPanelCollapsed(false);
          setIsAgentLogOpen(true);
        }}
        className="lg:hidden fixed bottom-5 right-5 z-40 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 px-3.5 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-slate-700 dark:border-emerald-400 font-mono text-xs font-bold hover:scale-105 active:scale-95 transition-all"
        title="Open Agent Reasoning Trace"
      >
        <Terminal size={15} />
        <span>Agent Trace</span>
        <span className="px-1.5 py-0.5 rounded-full bg-slate-800 dark:bg-emerald-600 text-[10px] text-emerald-400 dark:text-slate-950">
          {agentLogs.length}
        </span>
        {activeAgentPhase && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        )}
      </button>

      {/* DESKTOP / MAIN PERSISTENT PANEL */}
      <aside
        className={`hidden lg:flex flex-col h-full bg-white dark:bg-[#0B0D13] border-l border-slate-200 dark:border-[#1E2433] transition-all duration-300 ease-in-out shrink-0 select-none z-20 ${
          isAgentPanelCollapsed ? 'w-14' : 'w-88 xl:w-96'
        }`}
      >
        {/* COLLAPSED ICON RAIL */}
        {isAgentPanelCollapsed ? (
          <div className="flex flex-col items-center justify-between h-full py-4">
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={toggleAgentPanel}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Expand Agent Trace Panel"
              >
                <ChevronLeft size={16} />
              </button>

              <div 
                onClick={toggleAgentPanel}
                className="cursor-pointer flex flex-col items-center gap-2"
                title="Agent Reasoning Stream"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-xs relative">
                  <Terminal size={16} />
                  {activeAgentPhase && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 py-1 px-1.5 rounded bg-slate-100 dark:bg-slate-800">
                  {agentLogs.length}
                </span>
              </div>
            </div>

            {/* Collapsed rail bottom */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAgentLogOpen(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Open Modal Trace"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* EXPANDED AGENT PANEL */
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-3.5 px-4 border-b border-slate-200 dark:border-[#1E2433] flex items-center justify-between bg-slate-50/80 dark:bg-[#0F1117]/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                  <Terminal size={13} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                      Agent Reasoning
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Live decision stream • {agentLogs.length} events
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsAgentLogOpen(true)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Expand to Dialog"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={toggleAgentPanel}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Collapse to Rail"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* IN-FLIGHT PULSE INDICATOR */}
            {activeAgentPhase && (
              <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs font-mono shrink-0 animate-pulse">
                <Loader2 size={13} className="animate-spin text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                  Agent actively executing: {activeAgentPhase}...
                </span>
              </div>
            )}

            {/* TERMINAL STOP CONDITION BANNER */}
            {isTerminalStopped && (
              <div className="m-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-mono text-xs space-y-2 shrink-0 animate-fade-in shadow-xs">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="uppercase tracking-wider text-[11px]">Agent Loop Stopped</span>
                </div>
                <p className="text-[11px] leading-relaxed font-sans text-emerald-800 dark:text-emerald-300">
                  Readiness reached <strong>{readinessScore}%</strong> (threshold ≥80%). All critical uncertainties are empirically evidenced. The agent has stopped automated validation generation and returned decision authority to the human reviewer.
                </p>
              </div>
            )}

            {/* LOG STREAM LIST */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs select-text">
              {agentLogs.map((log) => {
                const isStop = log.isStop || log.phase === 'STOP';
                const isExpanded = expandedLogId === log.id;
                const badgeStyle = phaseBadgeColors[log.phase] || phaseBadgeColors.OBSERVE;

                if (isStop) {
                  return (
                    <div
                      key={log.id}
                      onClick={() => toggleLogExpansion(log.id)}
                      className="p-3 rounded-xl bg-emerald-950/40 dark:bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs shadow-xs space-y-1.5 cursor-pointer transition-all hover:border-emerald-400 animate-fade-in"
                    >
                      <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="shrink-0" />
                          <span className="font-bold tracking-wider uppercase">STOP CONDITION MET</span>
                        </div>
                        <span className="text-[10px] text-emerald-500/80">[{log.timestamp}]</span>
                      </div>
                      <p className="text-[11px] text-emerald-200 font-sans font-medium leading-relaxed">
                        {log.message}
                      </p>
                      {isExpanded && log.metadata && (
                        <div className="mt-2 pt-2 border-t border-emerald-800/60 text-[10px] space-y-1">
                          <PayloadViewer label="Stop Condition Details" data={log.metadata} />
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={log.id}
                    onClick={() => toggleLogExpansion(log.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer font-mono text-[11px] leading-relaxed animate-fade-in ${
                      isExpanded
                        ? 'bg-slate-100 dark:bg-[#151924] border-slate-300 dark:border-slate-700 shadow-xs'
                        : 'bg-white dark:bg-[#10131C] border-slate-200/80 dark:border-[#1E2433] hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Header Row: Phase badge, timestamp, duration, source */}
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                          {log.phase}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {log.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {log.durationMs !== undefined && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px]">
                            <Clock size={9} />
                            <span>{log.durationMs}ms</span>
                          </span>
                        )}

                        {log.source && (
                          <span className={`px-1 py-0.2 rounded text-[9px] font-semibold uppercase ${
                            log.source === 'ai'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {log.source === 'ai' ? 'Gemini' : 'Heuristic'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="text-slate-800 dark:text-slate-200 font-sans text-xs">
                      {log.message}
                    </div>

                    {/* Inline Expanded Details */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[11px] animate-fade-in">
                        {log.metadata?.requirementName && (
                          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            <span>Requirement:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {log.metadata.requirementName}
                            </span>
                          </div>
                        )}

                        {log.metadata?.previousStatus && log.metadata?.newStatus && (
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="text-slate-500 dark:text-slate-400">Status Shift:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {log.metadata.previousStatus} → {log.metadata.newStatus}
                            </span>
                          </div>
                        )}

                        {log.metadata?.reasoning && (
                          <div className="p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                            <span className="font-bold block mb-0.5 text-slate-900 dark:text-white">Reasoning:</span>
                            "{log.metadata.reasoning}"
                          </div>
                        )}

                        {/* Input Payload */}
                        {log.metadata?.input && (
                          <PayloadViewer label="Step Input" data={log.metadata.input} />
                        )}

                        {/* Output Payload */}
                        {log.metadata?.output && (
                          <PayloadViewer label="Step Output" data={log.metadata.output} />
                        )}

                        <div className="text-[9px] text-slate-400 dark:text-slate-500 text-right pt-0.5">
                          Click to collapse ▲
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>

            {/* Footer summary */}
            <div className="p-2.5 px-4 border-t border-slate-200 dark:border-[#1E2433] bg-slate-50 dark:bg-[#0B0D13] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-emerald-500" />
                <span>Deterministic + Gemini Fallback</span>
              </span>
              <span>{agentLogs.length} events</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
