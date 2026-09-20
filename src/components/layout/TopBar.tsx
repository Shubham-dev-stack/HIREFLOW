import React, { useState, useRef, useEffect } from 'react';
import { useHireFlow } from '../../context/HireFlowContext';
import { ShieldCheck, User, Briefcase, Terminal, Sun, Moon, AlertCircle, ChevronDown, Plus, Check, Menu } from 'lucide-react';
import { getResolvedModelName } from '../../services/ai/gemini';
import { DecisionQAEngine } from '../../services/analysis';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const { 
    candidate, 
    candidates,
    activeCandidateId,
    setActiveCandidateId,
    addNewCandidate,
    readinessScore,
    hasEvidenceBeenBuilt,
    role, 
    isAiActive,
    aiErrorNotice,
    isAgentLogOpen,
    setIsAgentLogOpen,
    isAgentPanelCollapsed,
    toggleAgentPanel,
    setIsSettingsOpen,
    agentLogs,
    theme,
    toggleTheme
  } = useHireFlow();

  const [isCandidateDropdownOpen, setIsCandidateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCandidateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modelName = getResolvedModelName();

  const getCandidateScore = (c: typeof candidate) => {
    if (!c.hasEvidenceBeenBuilt || !c.requirements) return null;
    const assessments = c.requirements.map(r => ({
      requirementId: r.id,
      name: r.name,
      importance: r.importance,
      status: r.status,
      evidence: [],
      primarySnippet: r.snippet || r.evidence,
      reasoning: r.reasoning,
      source: r.source,
      sourceLocation: r.sourceLocation
    }));
    return DecisionQAEngine.evaluate(assessments).readiness;
  };

  return (
    <header className="h-14 bg-white dark:bg-[#1A1F2E] border-b border-slate-200/80 dark:border-[#2D3748] px-4 sm:px-8 flex items-center justify-between shrink-0 select-none z-20 transition-colors">
      {/* Left: Hamburger (mobile), Role, and Interactive Candidate Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={18} />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 font-semibold text-slate-900 dark:text-[#F1F5F9]">
          <Briefcase size={14} className="text-slate-400 dark:text-slate-500" />
          <span className="truncate max-w-[140px] md:max-w-none">{role.title}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>

        {/* Candidate Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCandidateDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-[#2D3748] bg-slate-50 dark:bg-[#0F1117] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-[#F1F5F9] font-medium transition-colors cursor-pointer"
            title="Switch candidate or add new candidate"
          >
            <User size={13} className="text-slate-400 dark:text-slate-500" />
            <span className="font-semibold">{candidate.name}</span>

            {/* Candidate Readiness Mini Pill */}
            {hasEvidenceBeenBuilt ? (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                readinessScore >= 80 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' 
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
              }`}>
                {readinessScore}%
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                Unbuilt
              </span>
            )}

            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-150 ${isCandidateDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isCandidateDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-[#1A1F2E] border border-slate-200 dark:border-[#2D3748] rounded-xl shadow-xl py-1.5 z-50 text-xs animate-fade-in font-sans">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#2D3748]">
                Candidates ({candidates.length})
              </div>

              <div className="max-h-56 overflow-y-auto py-1">
                {candidates.map(c => {
                  const isSelected = c.id === activeCandidateId;
                  const score = getCandidateScore(c);

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveCandidateId(c.id);
                        setIsCandidateDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                        isSelected ? 'bg-slate-50/80 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-emerald-500' : 'bg-transparent'}`} />
                        <span className="truncate">{c.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {score !== null ? (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                            score >= 80
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          }`}>
                            {score}%
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            Unbuilt
                          </span>
                        )}
                        {isSelected && <Check size={13} className="text-emerald-600 dark:text-emerald-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-[#2D3748]">
                <button
                  onClick={() => {
                    const newId = addNewCandidate();
                    setActiveCandidateId(newId);
                    setIsCandidateDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-left text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 font-medium transition-colors cursor-pointer"
                >
                  <Plus size={13} />
                  <span>+ Add Another Candidate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle, AI Mode Status Badge, Evidence QA, & Agent Log Drawer Button */}
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

        {/* AI Provider Indicator Badge */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border transition-colors cursor-pointer ${
            isAiActive 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:border-emerald-400' 
              : 'bg-slate-50 dark:bg-[#0F1117] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-[#2D3748] hover:border-slate-300'
          }`}
          title={isAiActive ? `Gemini Active (${modelName}) — Click to view settings` : 'Deterministic Heuristic Active (Click to view settings)'}
        >
          <span 
            className={`w-2 h-2 rounded-full transition-colors ${
              isAiActive ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse' : 'bg-slate-400'
            }`} 
          />
          <span className="text-[11px] font-semibold">
            {isAiActive ? `Gemini (${modelName})` : 'Deterministic Heuristic'}
          </span>
          {aiErrorNotice && (
            <span title={`AI unavailable: ${aiErrorNotice}`} className="flex items-center">
              <AlertCircle size={12} className="text-amber-500" />
            </span>
          )}
        </button>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#0F1117] text-slate-700 dark:text-slate-300 text-xs font-mono font-medium border border-slate-200/60 dark:border-[#2D3748]">
          <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>Evidence QA</span>
        </div>

        {/* Collapsible Agent Log Toggle Button */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
              toggleAgentPanel();
            } else {
              setIsAgentLogOpen(!isAgentLogOpen);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
            (!isAgentPanelCollapsed || isAgentLogOpen)
              ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 border-slate-900 dark:border-emerald-400 shadow-xs' 
              : 'bg-white dark:bg-[#0F1117] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#2D3748] hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Toggle Agent Reasoning Trace"
        >
          <Terminal size={13} className={(!isAgentPanelCollapsed || isAgentLogOpen) ? (theme === 'dark' ? 'text-slate-950' : 'text-emerald-400') : 'text-slate-500 dark:text-slate-400'} />
          <span>Agent Log</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            (!isAgentPanelCollapsed || isAgentLogOpen)
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
