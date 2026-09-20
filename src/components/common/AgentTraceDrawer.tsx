import React, { useState } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { X, Terminal, Sparkles, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
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

export const AgentTraceDrawer: React.FC = () => {
  const { isAgentLogOpen, setIsAgentLogOpen, agentLogs } = useHireFlow();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isAgentLogOpen) return null;

  const toggleLogExpansion = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  const phaseColors: Record<string, string> = {
    OBSERVE: 'text-sky-400',
    DECIDE: 'text-amber-400',
    ANALYZE: 'text-purple-400',
    ACT: 'text-indigo-400',
    'RE-EVALUATE': 'text-emerald-400',
    STOP: 'text-emerald-400'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAgentLogOpen(false)}
      />

      {/* Slide-over Right Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-950 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col animate-slide-left font-mono">
          {/* Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Terminal size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Agent Reasoning Trace</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                <p className="text-[11px] text-slate-400">
                  Detailed inspection view • {agentLogs.length} events logged
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
          <div className="flex-1 overflow-y-auto p-5 space-y-3 text-xs select-text">
            {agentLogs.map((log) => {
              const isStop = log.isStop || log.phase === 'STOP';
              const isExpanded = expandedLogId === log.id;
              const color = phaseColors[log.phase] || 'text-slate-300';

              if (isStop) {
                return (
                  <div
                    key={log.id}
                    onClick={() => toggleLogExpansion(log.id)}
                    className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold text-xs leading-relaxed shadow-xs space-y-2 cursor-pointer transition-all hover:border-emerald-400"
                  >
                    <div className="flex items-center justify-between text-emerald-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span className="tracking-wider uppercase font-bold text-emerald-400">STOP CONDITION ACHIEVED</span>
                      </div>
                      <span className="text-[11px] text-emerald-500/80 font-mono">[{log.timestamp}]</span>
                    </div>
                    <div className="text-emerald-200 font-sans">
                      {log.message}
                    </div>
                    {isExpanded && log.metadata && (
                      <div className="pt-2 border-t border-emerald-800/60">
                        <PayloadViewer label="Stop Condition Telemetry" data={log.metadata} />
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={log.id}
                  onClick={() => toggleLogExpansion(log.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer font-mono leading-relaxed ${
                    isExpanded 
                      ? 'bg-slate-900 border-slate-700 shadow-xs' 
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">
                        [{log.timestamp}]
                      </span>
                      <span className={`font-bold tracking-wider uppercase text-xs ${color}`}>
                        {log.phase}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px]">
                      {log.durationMs !== undefined && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          <Clock size={10} />
                          <span>{log.durationMs}ms</span>
                        </span>
                      )}
                      {log.source && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          log.source === 'ai'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {log.source === 'ai' ? 'Gemini' : 'Heuristic'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-slate-200 font-sans text-xs">
                    {log.message}
                  </div>

                  {/* Expanded Inspector Section */}
                  {isExpanded && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2 text-[11px] animate-fade-in">
                      {log.metadata?.requirementName && (
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Target Criterion:</span>
                          <span className="text-white font-semibold">{log.metadata.requirementName}</span>
                        </div>
                      )}

                      {log.metadata?.previousStatus && log.metadata?.newStatus && (
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Status Shift:</span>
                          <span className="text-emerald-400 font-bold">
                            {log.metadata.previousStatus} → {log.metadata.newStatus}
                          </span>
                        </div>
                      )}

                      {log.metadata?.reasoning && (
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-sans leading-relaxed text-xs">
                          <span className="font-bold block text-white mb-1">Reasoning Analysis:</span>
                          "{log.metadata.reasoning}"
                        </div>
                      )}

                      {log.metadata?.input && (
                        <PayloadViewer label="Input Telemetry" data={log.metadata.input} />
                      )}

                      {log.metadata?.output && (
                        <PayloadViewer label="Output Telemetry" data={log.metadata.output} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer status */}
          <div className="p-3.5 px-5 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-400" />
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
